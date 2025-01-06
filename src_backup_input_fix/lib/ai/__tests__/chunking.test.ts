import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { generateChunks, processDocuments } from '../utils/chunking';
import { RateLimitError } from '../utils/errors';

describe('Document Chunking', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin' as const,
        department: 'management' as const
    };

    const mockTeam = {
        id: 'test-team-id',
        name: 'Test Team',
        department: 'sales'
    };

    beforeAll(() => {
        // Set up test environment
    });

    afterAll(() => {
        // Clean up test environment
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Chunk Generation', () => {
        it('should split text into appropriate chunks', async () => {
            const text = 'This is a test document. It should be split into chunks.';
            const chunks = await generateChunks(text, mockUser.id);
            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks[0].content).toBeDefined();
            expect(chunks[0].metadata).toBeDefined();
        });

        it('should handle very short documents', async () => {
            const text = 'Short text.';
            const chunks = await generateChunks(text, mockUser.id);
            expect(chunks.length).toBe(1);
            expect(chunks[0].content).toBe(text);
        });

        it('should handle documents with special characters', async () => {
            const text = 'Special chars: !@#$%^&*()_+\n\t';
            const chunks = await generateChunks(text, mockUser.id);
            expect(chunks.length).toBe(1);
            expect(chunks[0].content).toBe(text);
        });

        it('should handle empty documents gracefully', async () => {
            await expect(generateChunks('', mockUser.id))
                .rejects
                .toThrow('Empty document');
        });

        it('should handle extremely long documents', async () => {
            const longText = 'A'.repeat(10000);
            const chunks = await generateChunks(longText, mockUser.id);
            expect(chunks.length).toBeGreaterThan(1);
            chunks.forEach(chunk => {
                expect(chunk.content.length).toBeLessThanOrEqual(2000);
            });
        });

        it('should handle documents with invalid metadata', async () => {
            const text = 'Test document';
            const chunks = await generateChunks(text, mockUser.id, { invalid: true } as any);
            expect(chunks[0].metadata).toBeDefined();
            expect(chunks[0].metadata.userId).toBe(mockUser.id);
        });

        it('should handle rate limit exceeded scenario', async () => {
            const mockError = new RateLimitError('Rate limit exceeded');
            jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

            await expect(generateChunks('Test document', mockUser.id))
                .rejects
                .toThrow(RateLimitError);
        });
    });

    describe('Rate Limiting Integration', () => {
        it('should respect rate limits when processing multiple documents', async () => {
            const documents = Array(5).fill('Test document');
            const results = await processDocuments(documents, mockUser.id);
            expect(results.length).toBe(documents.length);
        });
    });

    describe('Batch Processing', () => {
        it('should process multiple documents with progress tracking', async () => {
            const documents = Array(3).fill('Test document');
            const progressCallback = jest.fn();

            await processDocuments(documents, mockUser.id, { onProgress: progressCallback });
            expect(progressCallback).toHaveBeenCalledTimes(documents.length);
        });

        it('should handle abort signal', async () => {
            const documents = Array(5).fill('Test document');
            const abortController = new AbortController();
            const processPromise = processDocuments(documents, mockUser.id, { 
                signal: abortController.signal 
            });

            abortController.abort();
            await expect(processPromise).rejects.toThrow('Aborted');
        });

        it('should respect rate limits in batch processing', async () => {
            const documents = Array(10).fill('Test document');
            const startTime = Date.now();
            await processDocuments(documents, mockUser.id);
            const duration = Date.now() - startTime;

            // With rate limiting, processing should take some time
            expect(duration).toBeGreaterThan(100);
        });
    });
}); 