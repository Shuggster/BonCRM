import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DocumentMetadata {
  title: string;
  pageCount: number;
  author?: string;
  creationDate?: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export class DocumentService {
  private supabase = createClientComponentClient();
  private readonly CHUNK_SIZE = 1000; // Characters per chunk

  private createChunks(text: string): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      if ((currentChunk + ' ' + word).length > this.CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async processPDFFile(fileUrl: string, fileName: string, userId: string): Promise<void> {
    try {
      console.log('Processing PDF file:', fileName);
      console.log('User ID:', userId);
      
      if (typeof window === 'undefined' || !window.pdfjsLib) {
        throw new Error('PDF.js is not loaded');
      }
      
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
      
      // Load the PDF document using browser-based PDF.js
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      // Get document metadata
      const metadata: DocumentMetadata = {
        title: fileName,
        pageCount: pdfDoc.numPages,
        author: undefined,
        creationDate: undefined
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

      // Create and store chunks
      const chunks = this.createChunks(fullText);
      const chunkInserts = chunks.map((chunk, index) => ({
        document_id: documentData.id,
        content: chunk,
        metadata: {
          pageCount: pdfDoc.numPages,
          chunkSize: this.CHUNK_SIZE,
          totalChunks: chunks.length,
          chunkIndex: index
        },
        user_id: userId,
        team_id: null,
        department: 'sales'
      }));

      const { error: chunksError } = await this.supabase
        .from('document_chunks')
        .insert(chunkInserts);

      if (chunksError) {
        throw new Error(`Error inserting chunks: ${chunksError.message}`);
      }

      console.log('Successfully processed PDF:', fileName);
      console.log('Created chunks:', chunks.length);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService(); 