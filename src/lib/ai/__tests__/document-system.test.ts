import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { DocumentSystem } from '../document-system';
import { RateLimitError } from '../utils/errors';
import { BaseProvider, ChatMessage, ChatResponse, EmbeddingResponse } from '../providers/base';

class MockProvider extends BaseProvider {
    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        return {
            content: 'Mock response',
            usage: {
                promptTokens: 50,
                completionTokens: 50,
                totalTokens: 100
            }
        };
    }

    async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
        yield 'Mock stream response';
    }

    async generateEmbedding(text: string): Promise<EmbeddingResponse> {
        return {
            embedding: Array.from(new Float32Array(10)),
            usage: {
                promptTokens: 25,
                totalTokens: 25
            }
        };
    }
}

describe('Document System', () => {
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

    let documentSystem: DocumentSystem;
    let mockProvider: MockProvider;

    beforeAll(() => {
        mockProvider = new MockProvider({
            apiKey: 'test-key',
            maxConcurrentRequests: 5,
            timeout: 10000
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        documentSystem = new DocumentSystem(mockProvider);
    });

    describe('Document Processing', () => {
        it('should process a single document', async () => {
            const document = {
                title: 'Test Document',
                content: 'This is a test document.',
                metadata: { type: 'test' }
            };

            const result = await documentSystem.processDocument(document, mockUser.id);
            expect(result).toBeDefined();
            expect(result.chunks).toBeDefined();
            expect(result.chunks.length).toBeGreaterThan(0);
        });

        it('should handle rate limits during processing', async () => {
            jest.spyOn(mockProvider, 'generateEmbedding').mockRejectedValueOnce(
                new RateLimitError('Rate limit exceeded')
            );

            const document = {
                title: 'Rate Limited Doc',
                content: 'This document will trigger a rate limit.',
                metadata: { type: 'test' }
            };

            await expect(documentSystem.processDocument(document, mockUser.id))
                .rejects
                .toThrow(RateLimitError);
        });

        it('should process documents in batches', async () => {
            const documents = Array(3).fill({
                title: 'Batch Document',
                content: 'This is a batch test document.',
                metadata: { type: 'batch-test' }
            });

            const results = await documentSystem.processBatch(documents, mockUser.id);
            expect(results).toHaveLength(documents.length);
            results.forEach((result: ProcessResult) => {
                expect(result.chunks).toBeDefined();
                expect(result.chunks.length).toBeGreaterThan(0);
            });
        });

        it('should handle errors in batch processing', async () => {
            const documents = [
                {
                    title: 'Valid Document',
                    content: 'This is a valid document.',
                    metadata: { type: 'test' }
                },
                {
                    title: 'Error Document',
                    content: '',  // This should cause an error
                    metadata: { type: 'test' }
                }
            ];

            const results = await documentSystem.processBatch(documents, mockUser.id);
            expect(results).toHaveLength(documents.length);
            expect(results[0].status).toBe('success');
            expect(results[1].status).toBe('error');
        });
    });

    describe('Search and Retrieval', () => {
        it('should search documents by similarity', async () => {
            const query = 'test query';
            const results = await documentSystem.searchSimilar(query, mockUser.id);
            expect(Array.isArray(results)).toBe(true);
        });

        it('should handle empty search results', async () => {
            jest.spyOn(mockProvider, 'generateEmbedding').mockResolvedValueOnce({
                embedding: Array.from(new Float32Array(10)),
                usage: {
                    promptTokens: 0,
                    totalTokens: 0
                }
            });

            const results = await documentSystem.searchSimilar('nonexistent', mockUser.id);
            expect(results).toHaveLength(0);
        });
    });

    describe('Document Updates', () => {
        it('should update document metadata', async () => {
            const document = {
                title: 'Update Test',
                content: 'This document will be updated.',
                metadata: { version: 1 }
            };

            const result = await documentSystem.processDocument(document, mockUser.id);
            const updated = await documentSystem.updateMetadata(
                result.id,
                { version: 2 },
                mockUser.id
            );

            expect(updated.metadata.version).toBe(2);
        });

        it('should handle concurrent updates', async () => {
            const document = {
                title: 'Concurrent Test',
                content: 'Testing concurrent updates.',
                metadata: { version: 1 }
            };

            const result = await documentSystem.processDocument(document, mockUser.id);
            
            // Simulate concurrent updates
            const updates = [
                documentSystem.updateMetadata(result.id, { version: 2 }, mockUser.id),
                documentSystem.updateMetadata(result.id, { version: 3 }, mockUser.id)
            ];

            const results = await Promise.allSettled(updates);
            expect(results.some(r => r.status === 'fulfilled')).toBe(true);
        });
    });
}); 