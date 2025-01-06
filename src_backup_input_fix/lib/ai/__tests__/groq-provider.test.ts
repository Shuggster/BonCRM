import { GroqProvider } from '../providers/groq';
import { ChatMessage } from '../providers/base';
import { RateLimitError, ValidationError } from '../utils/errors';

describe('GroqProvider', () => {
    let provider: GroqProvider;
    let mockFetch: jest.Mock;
    const mockMessages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' }
    ];

    beforeEach(() => {
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        provider = new GroqProvider({ apiKey: 'test-api-key' });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('chat', () => {
        it('should make a successful chat request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Hello! How can I help you today?' } }],
                    usage: {
                        prompt_tokens: 10,
                        completion_tokens: 20,
                        total_tokens: 30,
                    },
                }),
            } as Response);

            const response = await provider.chat(mockMessages);
            expect(response.content).toBe('Hello! How can I help you today?');
            expect(response.usage).toEqual({
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30,
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.groq.com/openai/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json',
                    },
                    body: expect.stringContaining('"model":"mixtral-8x7b-32768"'),
                }),
            );
        });

        it('should handle rate limit errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                headers: new Headers({ 'retry-after': '30' }),
            } as Response);

            await expect(provider.chat(mockMessages))
                .rejects
                .toThrow(RateLimitError);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should throw on non-retryable errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as Response);

            await expect(provider.chat(mockMessages))
                .rejects
                .toThrow('400 Bad Request');
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('should throw on empty messages', async () => {
            await expect(provider.chat([]))
                .rejects
                .toThrow(ValidationError);
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('chatStream', () => {
        it('should handle streaming responses', async () => {
            const mockRead = jest.fn();
            mockRead
                .mockResolvedValueOnce({
                    done: false,
                    value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
                })
                .mockResolvedValueOnce({
                    done: false,
                    value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n')
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
            } as ReadableStreamDefaultReader<Uint8Array>;

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

            expect(chunks).toEqual(['Hello', ' world']);
            expect(mockReader.releaseLock).toHaveBeenCalled();
        });

        it('should handle streaming errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
            } as Response);

            await expect(async () => {
                const chunks: string[] = [];
                for await (const chunk of provider.chatStream(mockMessages)) {
                    chunks.push(chunk);
                }
            }).rejects.toThrow('400 Bad Request');
        });
    });

    describe('generateEmbedding', () => {
        it('should generate embeddings successfully', async () => {
            const mockEmbedding = Array(1536).fill(0.1);
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: [{ embedding: mockEmbedding }],
                    usage: {
                        prompt_tokens: 10,
                        total_tokens: 10,
                    },
                }),
            } as Response);

            const response = await provider.generateEmbedding('test text');
            expect(response.embedding).toEqual(mockEmbedding);
            expect(response.usage).toEqual({
                promptTokens: 10,
                totalTokens: 10,
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.groq.com/openai/v1/embeddings',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer test-api-key',
                        'Content-Type': 'application/json',
                    },
                    body: expect.stringContaining('"model":"text-embedding-ada-002"'),
                }),
            );
        });

        it('should throw on empty text', async () => {
            await expect(provider.generateEmbedding(''))
                .rejects
                .toThrow(ValidationError);
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });
}); 