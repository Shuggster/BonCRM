import { DeepseekProvider } from '../providers/deepseek';
import { ChatMessage } from '../providers/base';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn().mockImplementation(() => Promise.resolve({} as Response)) as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('DeepseekProvider', () => {
    let provider: DeepseekProvider;
    const testConfig = {
        apiKey: 'test-api-key',
        isTest: true,
        retryConfig: {
            maxRetries: 1,
            initialDelay: 1,
            maxDelay: 10,
            backoffFactor: 1,
            jitterFactor: 0
        }
    };

    beforeEach(() => {
        provider = new DeepseekProvider(testConfig);
        jest.clearAllMocks();
    });

    describe('chat', () => {
        const mockMessages: ChatMessage[] = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello' }
        ];

        const mockResponse = {
            choices: [{
                message: {
                    content: 'Hello! How can I help you today?'
                }
            }],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
            }
        };

        it('should make a successful chat request', async () => {
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response));

            const result = await provider.chat(mockMessages);

            expect(result).toEqual({
                content: 'Hello! How can I help you today?',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.deepseek.com/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-api-key'
                    },
                    body: JSON.stringify({
                        messages: mockMessages.map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        model: 'deepseek-chat',
                        temperature: 0.7,
                        max_tokens: 1000
                    })
                })
            );
        });

        it('should handle rate limit errors', async () => {
            const rateLimitResponse = {
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                headers: new Headers({
                    'retry-after': '30'
                })
            } as Response;

            const successResponse = {
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response;

            mockFetch
                .mockResolvedValueOnce(rateLimitResponse)
                .mockResolvedValueOnce(successResponse);

            const result = await provider.chat(mockMessages);
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                content: mockResponse.choices[0].message.content,
                usage: {
                    promptTokens: mockResponse.usage.prompt_tokens,
                    completionTokens: mockResponse.usage.completion_tokens,
                    totalTokens: mockResponse.usage.total_tokens,
                }
            });
        });

        it('should throw on non-retryable errors', async () => {
            const errorResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve({ error: 'Invalid request' })
            } as Response;

            mockFetch.mockResolvedValueOnce(errorResponse);

            await expect(provider.chat(mockMessages))
                .rejects
                .toThrow('400 Bad Request');
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should throw on empty messages', async () => {
            await expect(provider.chat([]))
                .rejects
                .toThrow('No messages provided');
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('chatStream', () => {
        const mockMessages: ChatMessage[] = [
            { role: 'user', content: 'Hello' }
        ];

        it('should handle streaming responses', async () => {
            const mockRead = jest.fn<() => Promise<ReadableStreamReadResult<Uint8Array>>>();
            mockRead
                .mockResolvedValueOnce({
                    done: false,
                    value: new TextEncoder().encode(
                        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
                    )
                })
                .mockResolvedValueOnce({
                    done: false,
                    value: new TextEncoder().encode(
                        'data: {"choices":[{"delta":{"content":" there"}}]}\n\n'
                    )
                })
                .mockResolvedValueOnce({
                    done: true,
                    value: undefined
                });

            const mockReader = {
                read: mockRead,
                releaseLock: jest.fn(),
                closed: Promise.resolve(undefined),
                cancel: jest.fn()
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                body: { getReader: () => mockReader }
            } as unknown as Response);

            const chunks: string[] = [];
            for await (const chunk of provider.chatStream(mockMessages)) {
                chunks.push(chunk);
            }

            expect(chunks).toEqual(['Hello', ' there']);
            expect(mockReader.releaseLock).toHaveBeenCalled();
        });

        it('should handle streaming errors', async () => {
            const errorResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            } as Response;

            mockFetch.mockResolvedValueOnce(errorResponse);

            await expect(async () => {
                for await (const _ of provider.chatStream(mockMessages)) {
                    // Do nothing
                }
            }).rejects.toThrow('400 Bad Request');
        });
    });

    describe('generateEmbedding', () => {
        const mockResponse = {
            data: [{
                embedding: [0.1, 0.2, 0.3]
            }],
            usage: {
                prompt_tokens: 10,
                total_tokens: 10
            }
        };

        it('should generate embeddings successfully', async () => {
            mockFetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response));

            const result = await provider.generateEmbedding('test text');

            expect(result).toEqual({
                embedding: [0.1, 0.2, 0.3],
                usage: {
                    promptTokens: 10,
                    totalTokens: 10
                }
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.deepseek.com/v1/embeddings',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-api-key'
                    },
                    body: JSON.stringify({
                        model: 'deepseek-embed',
                        input: 'test text',
                        encoding_format: 'float'
                    })
                })
            );
        });

        it('should throw on empty text', async () => {
            await expect(provider.generateEmbedding(''))
                .rejects
                .toThrow('Empty text provided for embeddings');
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });
}); 