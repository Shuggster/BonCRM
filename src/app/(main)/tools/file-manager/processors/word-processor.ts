"use client"

import mammoth from 'mammoth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DocumentMetadata {
  title: string;
  pageCount?: number;
  author?: string;
  creationDate?: string;
}

interface Chunk {
  length: number;
  preview: string;
  endsWithPunctuation: boolean;
}

export class WordProcessor {
  private readonly CHUNK_SIZE = 1000;
  private supabase = createClientComponentClient();
  
  // Clean text by removing excessive whitespace and normalizing line breaks
  private cleanText(text: string): string {
    return text
      // Replace multiple newlines with a single one
      .replace(/\n{3,}/g, '\n\n')
      // Replace multiple spaces with a single space
      .replace(/[ \t]+/g, ' ')
      // Remove spaces before punctuation
      .replace(/\s+([.,;:!?])/g, '$1')
      // Normalize form fields
      .replace(/([A-Za-z]+):\s*\n+/g, '$1: ')
      // Clean up table-like structures
      .replace(/\t+/g, ' - ')
      // Trim whitespace
      .trim();
  }

  // Create chunks with improved text handling
  private createChunks(text: string): Chunk[] {
    const cleanedText = this.cleanText(text);
    const chunks: Chunk[] = [];
    let currentChunk = '';
    
    // Split into sentences (handling multiple punctuation marks)
    const sentences = cleanedText.match(/[^.!?]+[.!?]+|\s*\n\s*\n\s*|\s*$/g) || [];
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= this.CHUNK_SIZE) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push({
            length: currentChunk.length,
            preview: currentChunk.substring(0, 100) + '...',
            endsWithPunctuation: /[.!?]$/.test(currentChunk.trim())
          });
        }
        currentChunk = sentence;
      }
    }
    
    // Add the final chunk if it's not empty
    if (currentChunk.trim()) {
      chunks.push({
        length: currentChunk.length,
        preview: currentChunk.substring(0, 100) + '...',
        endsWithPunctuation: /[.!?]$/.test(currentChunk.trim())
      });
    }
    
    return chunks;
  }

  // Generate embedding with retry logic
  private async generateEmbedding(text: string, retries = 3): Promise<number[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch('http://localhost:3002/api/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate embedding: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
      } catch (error) {
        console.error(`Embedding generation attempt ${attempt}/${retries} failed:`, error);
        if (attempt === retries) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Failed to generate embedding after retries');
  }

  // Helper function to wait between operations
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Process Word file with improved error handling
  async processWordFile(filePath: string, fileName: string, userId: string): Promise<void> {
    console.log('Processing Word file:', fileName);
    console.log('User ID:', userId);
    console.log('File path:', filePath);

    try {
      // Download and process file (unchanged)...
      const { data: fileData, error: downloadError } = await this.supabase
        .storage
        .from('files')
        .download(`sales/${fileName}`);

      if (downloadError) throw downloadError;
      if (!fileData) throw new Error('No file data received');

      const result = await mammoth.extractRawText({ arrayBuffer: await fileData.arrayBuffer() });
      const text = result.value;
      if (!text) throw new Error('No text content extracted from Word document');

      // Create chunks
      const chunks = this.createChunks(text);
      console.log(`Created ${chunks.length} chunks from ${text.length} characters`);

      // Create document first
      const { data: documentData, error: insertError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          content: text,
          user_id: userId,
          file_name: fileName,
          file_path: `sales/${fileName}`,
          department: 'sales',
          is_private: false,
          metadata: {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            totalChunks: chunks.length,
            fileSize: fileData.size,
            processedAt: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      if (!documentData) throw new Error('No document data received after insertion');

      const documentId = documentData.id;
      console.log('Created document with ID:', documentId);

      // Process embeddings in smaller batches with delays
      const BATCH_SIZE = 3; // Reduced from 5 to 3
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)}`);
        
        // Generate embeddings for batch in parallel
        const embeddings = await Promise.all(
          batch.map(chunk => this.generateEmbedding(chunk.preview))
        );

        // Create chunk inserts for batch
        const batchInserts = batch.map((chunk, index) => ({
          document_id: documentId,
          content: chunk.preview,
          embedding: embeddings[index],
          user_id: userId,
          team_id: null,
          department: 'sales',
          metadata: {
            chunkIndex: i + index + 1,
            totalChunks: chunks.length,
            processedAt: new Date().toISOString()
          }
        }));

        // Insert batch of chunks
        const { error: chunkError } = await this.supabase
          .from('document_chunks')
          .insert(batchInserts);

        if (chunkError) throw chunkError;

        // Add delay between batches to avoid overwhelming the API
        if (i + BATCH_SIZE < chunks.length) {
          console.log('Waiting between batches...');
          await this.sleep(2000); // 2 second delay between batches
        }
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