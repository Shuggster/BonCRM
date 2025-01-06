import { BaseProvider } from './providers/base';
import { generateChunks } from './utils/chunking';

export interface Document {
    id?: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    chunks?: DocumentChunk[];
}

export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    embedding: number[];
    metadata: Record<string, any>;
}

export interface ProcessResult {
    id: string;
    chunks: DocumentChunk[];
    status: 'success' | 'error';
    error?: string;
}

export class DocumentSystem {
    constructor(private provider: BaseProvider) {}

    async processDocument(document: Document, userId: string): Promise<ProcessResult> {
        try {
            const chunks = await generateChunks(document.content, userId, document.metadata);
            const processedChunks: DocumentChunk[] = [];

            for (const chunk of chunks) {
                const { embedding } = await this.provider.generateEmbedding(chunk.content);
                processedChunks.push({
                    id: Math.random().toString(36).substring(7),
                    documentId: document.id || Math.random().toString(36).substring(7),
                    content: chunk.content,
                    embedding: Array.from(embedding),
                    metadata: chunk.metadata
                });
            }

            return {
                id: document.id || Math.random().toString(36).substring(7),
                chunks: processedChunks,
                status: 'success'
            };
        } catch (error) {
            throw error;
        }
    }

    async processBatch(documents: Document[], userId: string): Promise<ProcessResult[]> {
        const results: ProcessResult[] = [];

        for (const document of documents) {
            try {
                const result = await this.processDocument(document, userId);
                results.push(result);
            } catch (error) {
                results.push({
                    id: document.id || Math.random().toString(36).substring(7),
                    chunks: [],
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    }

    async searchSimilar(query: string, userId: string): Promise<DocumentChunk[]> {
        const { embedding } = await this.provider.generateEmbedding(query);
        // In a real implementation, this would search a vector database
        // For testing purposes, we return an empty array
        return [];
    }

    async updateMetadata(
        documentId: string,
        metadata: Record<string, any>,
        userId: string
    ): Promise<Document> {
        // In a real implementation, this would update the document in a database
        // For testing purposes, we return a mock document
        return {
            id: documentId,
            title: 'Mock Document',
            content: 'Mock content',
            metadata: metadata
        };
    }
} 