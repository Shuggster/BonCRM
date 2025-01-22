"use client"

import mammoth from 'mammoth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DocumentMetadata {
  title: string;
  pageCount?: number;
  author?: string;
  creationDate?: string;
}

export class WordProcessor {
  private supabase = createClientComponentClient();
  private readonly CHUNK_SIZE = 1000; // Characters per chunk

  private createChunks(text: string): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + ' ' + word).length > this.CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        console.log(`Created chunk ${chunks.length}:`, {
          length: currentChunk.trim().length,
          preview: currentChunk.trim().substring(0, 50) + '...',
          endsWithPunctuation: /[.!?]$/.test(currentChunk.trim())
        });
        currentChunk = word;
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      console.log(`Created final chunk ${chunks.length}:`, {
        length: currentChunk.trim().length,
        preview: currentChunk.trim().substring(0, 50) + '...',
        endsWithPunctuation: /[.!?]$/.test(currentChunk.trim())
      });
    }

    return chunks;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log('Sending text for embedding:', text.substring(0, 100) + '...');
      
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error response from embeddings API:', error);
        throw new Error(`Error generating embedding: ${error}`);
      }

      const data = await response.json();
      if (!data.data?.[0]?.embedding) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid embedding response format');
      }

      return data.data[0].embedding;
    } catch (error) {
      console.error('Error in generateEmbedding:', error);
      throw error;
    }
  }

  async processWordFile(fileUrl: string, fileName: string, userId: string): Promise<void> {
    try {
      console.log('Processing Word file:', fileName);
      console.log('User ID:', userId);
      
      // Download the file from Supabase storage
      const { data: fileData, error: downloadError } = await this.supabase
        .storage
        .from('files')
        .download(`sales/${fileName}`);

      if (downloadError) {
        throw new Error(`Error downloading file: ${downloadError.message}`);
      }

      if (!fileData) {
        throw new Error('No file data received');
      }

      // Convert blob to ArrayBuffer
      const arrayBuffer = await fileData.arrayBuffer();
      
      // Extract text from Word document
      const result = await mammoth.extractRawText({ arrayBuffer });
      const fullText = result.value;

      // Basic metadata for Word documents
      const metadata: DocumentMetadata = {
        title: fileName,
        pageCount: undefined, // Word docs don't have fixed pages
        author: undefined,
        creationDate: new Date().toISOString()
      };

      // Insert into documents table
      const { data: documentData, error: insertError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          content: fullText,
          metadata,
          file_name: fileName,
          file_path: `sales/${fileName}`,
          department: 'sales',
          is_private: false,
          user_id: userId
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error inserting document: ${insertError.message}`);
      }

      if (!documentData) {
        throw new Error('No document data received after insertion');
      }

      // Create and store chunks with embeddings
      const chunks = this.createChunks(fullText);
      const chunkInserts = await Promise.all(chunks.map(async (chunk, index) => {
        const embedding = await this.generateEmbedding(chunk);
        return {
          document_id: documentData.id,
          content: chunk,
          metadata: {
            totalChunks: chunks.length,
            chunkIndex: index
          },
          user_id: userId,
          team_id: null,
          department: 'sales',
          embedding
        };
      }));

      const { error: chunksError } = await this.supabase
        .from('document_chunks')
        .insert(chunkInserts);

      if (chunksError) {
        throw new Error(`Error inserting chunks: ${chunksError.message}`);
      }

      console.log('Successfully processed Word document:', fileName);
      console.log('Created chunks:', chunks.length);
    } catch (error) {
      console.error('Error processing Word document:', error);
      throw error;
    }
  }
}

export const wordProcessor = new WordProcessor(); 