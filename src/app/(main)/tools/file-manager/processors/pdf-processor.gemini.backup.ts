import { createClient } from '@supabase/supabase-js';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

interface DocumentMetadata {
  title: string;
  pageCount: number;
  author?: string;
  creationDate?: string;
  producer?: string;
}

export class PDFProcessor {
  private supabase;
  private userId: string;

  constructor(userId: string) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.userId = userId;
  }

  async createChunks(text: string, metadata: DocumentMetadata) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([text]);
    return chunks.map((chunk) => ({
      content: chunk.pageContent,
      metadata: {
        ...metadata,
        ...chunk.metadata,
      },
    }));
  }

  async generateEmbedding(text: string) {
    try {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate embedding: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async processPDFFile(filePath: string, fileName: string) {
    try {
      console.log('Starting PDF processing for:', fileName);

      // Download file from Supabase storage
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('sales')
        .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      // Convert the downloaded blob to an ArrayBuffer
      const arrayBuffer = await fileData.arrayBuffer();

      // Create a PDFLoader instance with the file buffer
      const loader = new PDFLoader(new Blob([arrayBuffer]));
      const docs = await loader.load();

      // Extract text content and metadata from the PDF
      const fullText = docs.map((doc) => doc.pageContent).join(' ');
      const metadata: DocumentMetadata = {
        title: fileName,
        pageCount: docs.length,
        ...docs[0]?.metadata,
      };

      // Create chunks from the text
      const chunks = await this.createChunks(fullText, metadata);
      console.log(`Created ${chunks.length} chunks from PDF`);

      // Insert document record
      const { data: document, error: documentError } = await this.supabase
        .from('documents')
        .insert({
          title: fileName,
          content: fullText,
          metadata,
          user_id: this.userId,
          file_path: filePath,
        })
        .select()
        .single();

      if (documentError) {
        throw new Error(`Failed to insert document: ${documentError.message}`);
      }

      // Process each chunk and generate embeddings
      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk.content);

        const { error: chunkError } = await this.supabase
          .from('document_chunks')
          .insert({
            document_id: document.id,
            content: chunk.content,
            metadata: chunk.metadata,
            embedding,
          });

        if (chunkError) {
          console.error('Error inserting chunk:', chunkError);
          throw new Error(`Failed to insert chunk: ${chunkError.message}`);
        }
      }

      console.log('Successfully processed PDF:', fileName);
      return document;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }
} 