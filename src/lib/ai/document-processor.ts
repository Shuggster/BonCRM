import { createClient } from '@supabase/supabase-js';
import { AIProviderFactory } from './provider-factory';
import { Database } from '@/types/supabase';
import { DocumentMatch } from '@/lib/supabase/types';
import { AIProvider } from './providers/base';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

interface DocumentProcessorOptions {
    userId: string;
    teamId?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    minChunkLength?: number;
}

const DEFAULT_OPTIONS: Omit<DocumentProcessorOptions, 'userId' | 'teamId'> = {
    chunkSize: 1000,
    chunkOverlap: 200,
    minChunkLength: 100
};

interface ProcessingProgress {
    totalDocuments: number;
    processedDocuments: number;
    totalChunks: number;
    processedChunks: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}

interface BatchProcessingOptions {
    concurrency?: number;
    onProgress?: (progress: ProcessingProgress) => void;
    abortSignal?: AbortSignal;
}

interface ProcessedDocument {
    title: string;
    content: string;
    metadata?: any;
    isPrivate?: boolean;
    teamId?: string;
    chunks: Array<{
        content: string;
        embedding: number[];
        metadata?: any;
    }>;
}

export class DocumentProcessor {
    private supabase: ReturnType<typeof createClient<Database>>;
    private embedder: AIProvider;
    private options: DocumentProcessorOptions;
    private progress: ProcessingProgress;

    constructor(
        options: DocumentProcessorOptions,
        supabaseUrl: string,
        supabaseKey: string,
        aiConfig: {
            groq?: { apiKey: string };
            deepseek?: { apiKey: string };
            gemini?: { apiKey: string };
        }
    ) {
        this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
        this.embedder = AIProviderFactory.getInstance(aiConfig).getBestProvider();
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.progress = {
            totalDocuments: 0,
            processedDocuments: 0,
            totalChunks: 0,
            processedChunks: 0,
            status: 'pending'
        };
    }

    private async verifyAccess(operation: 'read' | 'write'): Promise<void> {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        // Verify user exists in users table and is active
        const { data: user } = await this.supabase
            .from('users')
            .select('is_active, department')
            .eq('id', session.user.id)
            .single();

        if (!user || !user.is_active) {
            throw new Error('User not found or inactive');
        }

        // Store the user's department in the session for later use
        session.user.department = user.department;
    }

    /**
     * Process a document by splitting it into chunks and generating embeddings
     */
    async processDocument(
        title: string,
        content: string,
        userId: string,
        teamId?: string,
        metadata: Record<string, any> = {},
        isPrivate: boolean = false
    ) {
        try {
            await this.verifyAccess('write');
            const session = await getServerSession(authOptions);
            
            // Validate content
            if (!content || content.trim().length === 0) {
                throw new Error('Document content cannot be empty');
            }

            // Split content into chunks first to validate we can process them
            const chunks = this.splitIntoChunks(content);
            console.log(`Created ${chunks.length} chunks from document`);

            // Start transaction
            const { data: document, error: docError } = await this.supabase
                .rpc('begin_document_processing', {
                    p_title: title,
                    p_content: content,
                    p_metadata: metadata,
                    p_user_id: userId,
                    p_team_id: teamId,
                    p_is_private: isPrivate,
                    p_department: session?.user.department
                });

            if (docError) throw docError;
            if (!document) throw new Error('Failed to create document');

            try {
                // Process each chunk within the transaction
                const processedChunks = [];
                for (const chunk of chunks) {
                    try {
                        // Generate embedding
                        const embedding = await this.embedder.generateEmbeddings(chunk);
                        console.log(`Generated embedding for chunk: ${chunk.substring(0, 50)}...`);

                        // Store chunk with embedding in transaction
                        const { data: chunkData, error: chunkError } = await this.supabase
                            .rpc('add_document_chunk', {
                                p_document_id: document.id,
                                p_content: chunk,
                                p_embedding: embedding,
                                p_metadata: document.metadata,
                                p_user_id: userId,
                                p_team_id: teamId,
                                p_department: session?.user.department
                            });

                        if (chunkError) {
                            console.error('Error storing chunk:', chunkError);
                            throw chunkError;
                        }
                        processedChunks.push(chunkData);
                    } catch (error) {
                        console.error('Error processing chunk:', error);
                        // Rollback transaction
                        await this.supabase.rpc('rollback_document_processing', {
                            p_document_id: document.id
                        });
                        throw error;
                    }
                }

                // Commit transaction
                const { error: commitError } = await this.supabase
                    .rpc('commit_document_processing', {
                        p_document_id: document.id
                    });

                if (commitError) throw commitError;

                return { ...document, chunks: processedChunks };
            } catch (error) {
                // Ensure rollback on any error
                await this.supabase.rpc('rollback_document_processing', {
                    p_document_id: document.id
                });
                throw error;
            }
        } catch (error) {
            console.error('Error processing document:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to process document');
        }
    }

    /**
     * Split text into overlapping chunks
     */
    private splitIntoChunks(text: string): string[] {
        const { chunkSize, chunkOverlap, minChunkLength } = this.options;
        const chunks: string[] = [];
        
        // Normalize whitespace but preserve special characters
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        
        // Split into sentences while preserving special characters
        const sentences = normalizedText.split(/(?<=[.!?])\s+/);
        
        let currentChunk = '';
        
        for (const sentence of sentences) {
            // If adding this sentence would exceed chunk size
            if (currentChunk.length + sentence.length > chunkSize!) {
                // Save current chunk if it's long enough
                if (currentChunk.length >= minChunkLength!) {
                    chunks.push(currentChunk.trim());
                }
                // Start new chunk with overlap from previous chunk
                const words = currentChunk.split(' ');
                const overlapWords = Math.floor(chunkOverlap! / 10);
                currentChunk = words.slice(-overlapWords).join(' ');
                // Add the sentence to the new chunk
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
                // Add sentence to current chunk
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }

        // Add the last chunk if it's long enough
        if (currentChunk.length >= minChunkLength!) {
            chunks.push(currentChunk.trim());
        }

        // If no chunks were created (text was too short), use the entire text as one chunk
        if (chunks.length === 0 && text.length > 0) {
            chunks.push(text.trim());
        }
        
        return chunks;
    }

    /**
     * Search for similar documents
     */
    async searchSimilarDocuments(
        query: string,
        userId: string,
        options: {
            threshold?: number;
            limit?: number;
            teamId?: string;
        } = {}
    ): Promise<DocumentMatch[]> {
        try {
            await this.verifyAccess('read');
            const session = await getServerSession(authOptions);
            
            const { threshold = 0.7, limit = 5 } = options;
            
            // Generate embedding for the query
            const embedding = await this.embedder.generateEmbeddings(query);
            
            // Search for similar chunks with department filtering
            const { data: matches, error } = await this.supabase
                .rpc('match_documents', {
                    query_embedding: embedding,
                    match_threshold: threshold,
                    match_count: limit,
                    current_user_id: userId,
                    user_department: session?.user.department
                });

            if (error) {
                console.error('Error in match_documents:', error);
                throw error;
            }

            if (!matches || matches.length === 0) {
                console.log('No matches found for query:', query);
                console.log('Search parameters:', {
                    threshold,
                    limit,
                    userId,
                    department: session?.user.department
                });
            }
            
            return matches as DocumentMatch[];
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    }

    /**
     * Get all documents for a user
     */
    async getUserDocuments(userId: string) {
        await this.verifyAccess('read');
        const session = await getServerSession();

        const { data, error } = await this.supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .eq('department', session?.user.department);

        if (error) throw error;
        return data;
    }

    /**
     * Get all documents for a team
     */
    async getTeamDocuments(teamId: string) {
        const { data, error } = await this.supabase
            .from('documents')
            .select('*')
            .eq('team_id', teamId);

        if (error) throw error;
        return data;
    }

    /**
     * Get the maximum chunk size for document processing
     */
    public getMaxChunkSize(): number {
        return this.options.chunkSize || DEFAULT_OPTIONS.chunkSize!;
    }

    /**
     * Process multiple documents in parallel with progress tracking
     */
    async processBatch(
        documents: { title: string; content: string; metadata?: any; isPrivate?: boolean; teamId?: string }[],
        userId: string,
        teamId: string,
        options: BatchProcessingOptions = {}
    ): Promise<PromiseSettledResult<ProcessedDocument>[]> {
        const { concurrency = 2, onProgress, abortSignal } = options;
        const maxRetries = 3;
        const retryDelay = 1000;

        this.progress = {
            totalDocuments: documents.length,
            processedDocuments: 0,
            totalChunks: 0,
            processedChunks: 0,
            status: 'processing'
        };

        try {
            // Process documents in batches to respect rate limits
            const results = [];
            for (let i = 0; i < documents.length; i += concurrency) {
                if (abortSignal?.aborted) {
                    throw new Error('Processing aborted by user');
                }

                const batch = documents.slice(i, i + concurrency);
                const batchResults = await Promise.allSettled(
                    batch.map(async doc => {
                        let retries = 0;
                        while (retries < maxRetries) {
                            try {
                                const result = await this.processDocument(
                                    doc.title,
                                    doc.content,
                                    userId,
                                    doc.teamId,
                                    doc.metadata,
                                    doc.isPrivate
                                );

                                this.progress.processedDocuments++;
                                this.progress.totalChunks += result.chunks.length;
                                this.progress.processedChunks += result.chunks.length;
                                
                                if (onProgress) {
                                    onProgress({ ...this.progress });
                                }

                                return result;
                            } catch (error) {
                                if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
                                    retries++;
                                    if (retries < maxRetries) {
                                        // Wait for the retry delay before trying again
                                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                                        continue;
                                    }
                                }
                                throw error;
                            }
                        }
                    })
                );

                results.push(...batchResults);

                // Add a delay between batches to help with rate limiting
                if (i + concurrency < documents.length) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * 2));
                }
            }

            this.progress.status = 'completed';
            if (onProgress) {
                onProgress({ ...this.progress });
            }

            return results;
        } catch (error) {
            this.progress.status = 'error';
            this.progress.error = error instanceof Error ? error.message : 'Unknown error';
            if (onProgress) {
                onProgress({ ...this.progress });
            }
            throw error;
        }
    }

    /**
     * Get current processing progress
     */
    getProgress(): ProcessingProgress {
        return { ...this.progress };
    }
} 