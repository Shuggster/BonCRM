import { DocumentProcessor } from '../document-processor';
import { setupTestData, cleanupTestData } from '../tests/setup';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Session } from 'next-auth';

// Mock NextAuth session with custom user data
const mockSession = {
    user: {
        id: '',  // Will be set in beforeEach
        email: 'hugh@bonnymans.co.uk',
        name: 'Hugh Bonnyman',
        role: 'admin',
        department: 'management',
        is_active: true
    }
};

// Mock auth options
jest.mock('@/lib/auth/auth-options', () => ({
    authOptions: {
        providers: [],
        callbacks: {
            session: ({ session }: { session: Session }) => session
        }
    }
}));

// Mock NextAuth
jest.mock('next-auth', () => ({
    getServerSession: jest.fn(async () => mockSession)
}));

describe('Document Chunking', () => {
    let processor: DocumentProcessor;
    let testUser: { id: string };
    let testTeam: { id: string };
    let supabase: ReturnType<typeof createClient<Database>>;

    beforeAll(async () => {
        const testData = await setupTestData();
        testUser = testData.user;
        testTeam = testData.team;

        // Initialize Supabase client
        supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    beforeEach(() => {
        // Update mock session with current test user
        mockSession.user.id = testUser.id;

        processor = new DocumentProcessor(
            {
                userId: testUser.id,
                teamId: testTeam.id,
                chunkSize: 100,      // Small chunk size for testing
                chunkOverlap: 20,    // Small overlap for testing
                minChunkLength: 30   // Small minimum length for testing
            },
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                groq: { apiKey: process.env.GROQ_API_KEY! },
                deepseek: { apiKey: process.env.DEEPSEEK_API_KEY! },
                gemini: { apiKey: process.env.GEMINI_API_KEY! }
            }
        );
    });

    describe('Chunk Generation', () => {
        it('should split text into appropriate chunks', async () => {
            const testDoc = {
                title: 'Chunking Test',
                content: `
                    This is the first sentence of the test document. 
                    This is the second sentence with some additional content. 
                    Here's a third sentence that adds more information.
                    The fourth sentence continues the document.
                    Finally, we have a fifth sentence to ensure proper chunking.
                `.trim(),
                metadata: { test: 'chunking' }
            };

            const document = await processor.processDocument(
                testDoc.title,
                testDoc.content,
                testUser.id,
                testTeam.id,
                testDoc.metadata
            );

            // Verify chunks in database
            const { data: chunks } = await supabase
                .from('document_chunks')
                .select('*')
                .eq('document_id', document.id)
                .order('id');

            expect(chunks).toBeDefined();
            expect(chunks!.length).toBeGreaterThan(1); // Should create multiple chunks
            
            // Verify chunk properties
            chunks!.forEach((chunk: any, index: number) => {
                // Each chunk should have content
                expect(chunk.content.length).toBeGreaterThan(0);
                
                // Each chunk should be within size limits
                expect(chunk.content.length).toBeLessThanOrEqual(100);
                
                // Each chunk should have embeddings
                expect(chunk.embedding).toBeDefined();
                // PostgreSQL vector type is returned as a string array
                const embedding = chunk.embedding.replace(/[{}\s]/g, '').split(',').map(Number);
                expect(Array.isArray(embedding)).toBe(true);
                expect(embedding.length).toBeGreaterThan(0);
                
                // Verify overlap between chunks
                if (index > 0) {
                    const prevChunk = chunks![index - 1];
                    const overlap = findOverlap(prevChunk.content, chunk.content);
                    expect(overlap.length).toBeGreaterThan(0);
                }
            });
        });

        it('should handle very short documents', async () => {
            const shortDoc = {
                title: 'Short Document',
                content: 'This is a very short document.',
                metadata: { test: 'short' }
            };

            const document = await processor.processDocument(
                shortDoc.title,
                shortDoc.content,
                testUser.id,
                testTeam.id,
                shortDoc.metadata
            );

            const { data: chunks } = await supabase
                .from('document_chunks')
                .select('*')
                .eq('document_id', document.id);

            expect(chunks).toBeDefined();
            expect(chunks!.length).toBe(1); // Should create single chunk
            expect(chunks![0].content).toBe(shortDoc.content);
        });

        it('should handle documents with special characters', async () => {
            const specialDoc = {
                title: 'Special Characters',
                content: 'This document has special characters: !@#$%^&*(). It should handle them properly. New line\nand tabs\tshould work too.',
                metadata: { test: 'special' }
            };

            const document = await processor.processDocument(
                specialDoc.title,
                specialDoc.content,
                testUser.id,
                testTeam.id,
                specialDoc.metadata
            );

            const { data: chunks } = await supabase
                .from('document_chunks')
                .select('*')
                .eq('document_id', document.id);

            expect(chunks).toBeDefined();
            expect(chunks!.length).toBeGreaterThan(0);
            
            // Verify special characters are preserved
            const allContent = chunks!.map((c: any) => c.content).join(' ');
            expect(allContent).toContain('!@#$%^&*()');
            expect(allContent).toContain('New line');
            expect(allContent).toContain('tabs');
        });

        it('should handle empty documents gracefully', async () => {
            const emptyDoc = {
                title: 'Empty Document',
                content: '',
                metadata: { test: 'empty' }
            };

            await expect(processor.processDocument(
                emptyDoc.title,
                emptyDoc.content,
                testUser.id,
                testTeam.id,
                emptyDoc.metadata
            )).rejects.toThrow('Document content cannot be empty');
        });

        it('should handle extremely long documents', async () => {
            // Use a smaller document size to avoid timeouts
            const longContent = 'This is a test sentence. '.repeat(100);
            const result = await processor.processDocument(
                'Long Document',
                longContent,
                testUser.id,
                testTeam.id,
                { type: 'test' }
            );
            expect(result.chunks.length).toBeGreaterThan(2);
            for (const chunk of result.chunks) {
                expect(chunk.content.length).toBeLessThanOrEqual(processor.getMaxChunkSize());
            }
        }, 30000);

        it('should handle documents with invalid metadata', async () => {
            const invalidMetadataDoc = {
                title: 'Invalid Metadata',
                content: 'This is a test document.',
                metadata: {
                    circular: {} as any
                }
            };
            invalidMetadataDoc.metadata.circular.self = invalidMetadataDoc.metadata;

            await expect(processor.processDocument(
                invalidMetadataDoc.title,
                invalidMetadataDoc.content,
                testUser.id,
                testTeam.id,
                invalidMetadataDoc.metadata
            )).rejects.toThrow();
        });

        it('should handle rate limit exceeded scenario', async () => {
            const docs = Array.from({ length: 10 }, (_, i) => ({
                title: `Test Document ${i}`,
                content: `This is test document ${i} for rate limiting. It contains enough content to test rate limiting.`,
                metadata: { type: 'test' }
            }));

            const results = await Promise.allSettled(
                docs.map(doc => processor.processDocument(
                    doc.title,
                    doc.content,
                    testUser.id,
                    testTeam.id,
                    doc.metadata
                ))
            );
            const errors = results
                .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
                .map(r => r.reason);
            
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e instanceof Error && e.message.includes('Rate limit'))).toBe(true);
        }, 30000); // Increased timeout to 30 seconds
    });

    describe('Rate Limiting Integration', () => {
        it('should respect rate limits when processing multiple documents', async () => {
            const docs = Array.from({ length: 5 }, (_, i) => ({
                title: `Rate Test ${i}`,
                content: `Rate limit test document ${i}`,
                metadata: { type: 'test' }
            }));

            let error: unknown;
            try {
                await Promise.all(
                    docs.map(doc => processor.processDocument(
                        doc.title,
                        doc.content,
                        testUser.id,
                        testTeam.id,
                        doc.metadata
                    ))
                );
                throw new Error('Expected rate limit error');
            } catch (e) {
                error = e;
            }
            expect(error instanceof Error && error.message.includes('Rate limit')).toBe(true);
        }, 30000); // Increased timeout to 30 seconds
    });

    describe('Batch Processing', () => {
        it('should process multiple documents with progress tracking', async () => {
            const documents = Array.from({ length: 3 }, (_, i) => ({
                title: `Batch Test ${i}`,
                content: `This is test document ${i} for batch processing. It contains enough content to test progress tracking.`,
                metadata: { type: 'batch-test' }
            }));

            const progress: any[] = [];
            const results = await processor.processBatch(
                documents,
                testUser.id,
                testTeam.id,
                {
                    concurrency: 2,
                    onProgress: (p) => progress.push({ ...p })
                }
            );

            // Verify results
            expect(results).toHaveLength(3);
            expect(results.every(r => r.status === 'fulfilled')).toBe(true);

            // Verify progress tracking
            expect(progress.length).toBeGreaterThan(0);
            expect(progress[progress.length - 1]).toEqual(
                expect.objectContaining({
                    totalDocuments: 3,
                    processedDocuments: 3,
                    status: 'completed'
                })
            );
        }, 30000);

        it('should handle abort signal', async () => {
            const documents = Array.from({ length: 5 }, (_, i) => ({
                title: `Abort Test ${i}`,
                content: `This is test document ${i} for abort testing.`,
                metadata: { type: 'abort-test' }
            }));

            const controller = new AbortController();
            const progressPromise = processor.processBatch(
                documents,
                testUser.id,
                testTeam.id,
                {
                    concurrency: 1,
                    abortSignal: controller.signal
                }
            );

            // Abort after a short delay
            setTimeout(() => controller.abort(), 100);

            await expect(progressPromise).rejects.toThrow('Processing aborted by user');
        });

        it('should respect rate limits in batch processing', async () => {
            const documents = Array.from({ length: 6 }, (_, i) => ({
                title: `Rate Test ${i}`,
                content: `This is test document ${i} for rate limit testing in batch mode.`,
                metadata: { type: 'rate-test' }
            }));

            const progress: any[] = [];
            await processor.processBatch(
                documents,
                testUser.id,
                testTeam.id,
                {
                    concurrency: 2,
                    onProgress: (p) => progress.push({ ...p })
                }
            );

            // Verify that documents were processed in batches
            const processingTimes = progress
                .filter(p => p.processedDocuments > 0)
                .map(p => p.processedDocuments);
            
            // Verify that we have progress updates
            expect(processingTimes.length).toBeGreaterThan(0);
            
            // Verify that we processed all documents
            expect(processingTimes[processingTimes.length - 1]).toBe(documents.length);
            
            // Verify that we didn't process all documents at once
            expect(processingTimes[0]).toBeLessThan(documents.length);
        }, 30000);
    });
});

// Helper function to find overlap between two strings
function findOverlap(str1: string, str2: string): string {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    let maxOverlap = '';

    for (let i = 0; i < words1.length; i++) {
        for (let j = 0; j < words2.length; j++) {
            let overlap = '';
            let k = 0;
            while (i + k < words1.length && j + k < words2.length && words1[i + k] === words2[j + k]) {
                overlap += words1[i + k] + ' ';
                k++;
            }
            if (overlap.length > maxOverlap.length) {
                maxOverlap = overlap.trim();
            }
        }
    }
    return maxOverlap;
} 