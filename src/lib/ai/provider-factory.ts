import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import { DeepseekProvider } from '../providers/deepseek-provider';
import { GroqProvider } from '../providers/groq-provider';
import { GeminiProvider } from '../providers/gemini-provider';
import { AIProvider, ChatMessage } from '../providers/base-provider';
import { RetryConfig } from '../utils/retry-handler';
import { config } from 'dotenv';
import path from 'path';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

config({
    path: path.resolve(process.cwd(), '.env.test')
});

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

const mockCompletionResponse = {
    choices: [{
        message: {
            content: 'Test response'
        }
    }],
    usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
    }
};

const mockGeminiResponse = {
    candidates: [{
        content: {
            parts: [{
                text: 'Test response'
            }]
        }
    }],
    usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 20,
        totalTokenCount: 30
    }
};

const mockEmbeddingResponse = {
    data: [{
        embedding: [0.1, 0.2, 0.3]
    }],
    usage: {
        prompt_tokens: 10,
        total_tokens: 10
    }
};

const mockGeminiEmbeddingResponse = {
    embedding: {
        values: [0.1, 0.2, 0.3]
    },
    usageMetadata: {
        tokenCount: 10
    }
};

const testRetryConfig: RetryConfig = {
    maxRetries: 1,
    initialDelay: 1,
    maxDelay: 10,
    backoffFactor: 1,
    jitterFactor: 0
};

beforeAll(() => {
    jest.useRealTimers();
});

const testProviders: Array<{
    name: string;
    provider: AIProvider;
    completionResponse: any;
    embeddingResponse: any;
}> = [
    {
        name: 'Deepseek Provider',
        provider: new DeepseekProvider({ apiKey: 'test-key', retryConfig: testRetryConfig }),
        completionResponse: mockCompletionResponse,
        embeddingResponse: mockEmbeddingResponse
    },
    {
        name: 'Groq Provider',
        provider: new GroqProvider({ apiKey: 'test-key', retryConfig: testRetryConfig }),
        completionResponse: mockCompletionResponse,
        embeddingResponse: mockEmbeddingResponse
    },
    {
        name: 'Gemini Provider',
        provider: new GeminiProvider({ apiKey: 'test-key', retryConfig: testRetryConfig }),
        completionResponse: mockGeminiResponse,
        embeddingResponse: mockGeminiEmbeddingResponse
    }
];

testProviders.forEach(({ name, provider, completionResponse, embeddingResponse }) => {
    describe(name, () => {
        const testPrompt = 'Hello, how are you?';
        const testMessage: ChatMessage = { role: 'user', content: testPrompt };

        beforeEach(() => {
            mockFetch.mockReset();
            mockFetch.mockImplementation(async (url: string | URL | Request) => {
                const urlString = url.toString();
                if (urlString.includes('/chat/completions') || urlString.includes('generateContent')) {
                    if (urlString.includes('stream=true') || urlString.includes('streamGenerateContent')) {
                        const streamData = name.includes('Gemini') ? [
                            JSON.stringify({
                                candidates: [{
                                    content: {
                                        parts: [{
                                            text: 'Te'
                                        }]
                                    }
                                }]
                            }),
                            JSON.stringify({
                                candidates: [{
                                    content: {
                                        parts: [{
                                            text: 'st'
                                        }]
                                    }
                                }]
                            }),
                            JSON.stringify({ done: true })
                        ] : [
                            'data: {"choices":[{"delta":{"content":"Te"}}]}\n\n',
                            'data: {"choices":[{"delta":{"content":"st"}}]}\n\n',
                            'data: [DONE]\n\n'
                        ];
                        const encoder = new TextEncoder();
                        const readableStream = new ReadableStream({
                            start(controller) {
                                streamData.forEach((chunk) => {
                                    controller.enqueue(encoder.encode(chunk));
                                });
                                controller.close();
                            }
                        });
                        return new Response(readableStream, {
                            status: 200,
                            headers: {
                                'Content-Type': name.includes('Gemini') ? 'application/json' : 'text/event-stream'
                            }
                        });
                    }
                    return new Response(JSON.stringify(name.includes('Gemini') ? mockGeminiResponse : mockCompletionResponse), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                if (urlString.includes('/embeddings') || urlString.includes('embedText')) {
                    return new Response(JSON.stringify(name.includes('Gemini') ? mockGeminiEmbeddingResponse : mockEmbeddingResponse), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                return new Response(null, {
                    status: 404
                });
            });
        });

        it('should chat', async () => {
            const response = await provider.chat([testMessage]);
            expect(response.content).toBe('Test response');
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(name.includes('Gemini') ? 'generateContent' : '/chat/completions'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining(testPrompt)
                })
            );
        }, 15000);

        it('should stream chat', async () => {
            const chunks: string[] = [];
            const onChunk = jest.fn((chunk: string) => {
                chunks.push(chunk);
            });

            const stream = provider.chatStream([testMessage]);
            for await (const chunk of stream) {
                onChunk(chunk);
            }

            expect(onChunk).toHaveBeenCalledTimes(2);
            expect(onChunk).toHaveBeenNthCalledWith(1, 'Te');
            expect(onChunk).toHaveBeenNthCalledWith(2, 'st');
            expect(chunks.join('')).toBe('Test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(name.includes('Gemini') ? 'streamGenerateContent' : '/chat/completions'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining(testPrompt)
                })
            );
        }, 15000);

        it('should generate embedding', async () => {
            const result = await provider.generateEmbedding(testPrompt);
            expect(result.embedding).toEqual([0.1, 0.2, 0.3]);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(name.includes('Gemini') ? 'embedText' : '/embeddings'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining(testPrompt)
                })
            );
        }, 15000);

        it('should handle empty input', async () => {
            await expect(provider.chat([{ role: 'user', content: '' }])).rejects.toThrow('Empty');
            await expect(provider.chatStream([{ role: 'user', content: '' }]).next()).rejects.toThrow('Empty');
            await expect(provider.generateEmbedding('')).rejects.toThrow('Empty');
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should handle rate limits', async () => {
            mockFetch.mockImplementation(() => 
                Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }))
            );

            const mockFn = jest.fn(() => provider.chat([testMessage]));
            const promises = Array(5).fill(null).map(() => mockFn());
            
            await expect(Promise.all(promises)).rejects.toThrow(/Rate limit exceeded/);
            expect(mockFn.mock.calls.length).toBe(5);
        }, 15000);

        it('should retry on rate limit errors', async () => {
            mockFetch
                .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })))
                .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(name.includes('Gemini') ? mockGeminiResponse : mockCompletionResponse), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })));

            const response = await provider.chat([testMessage]);
            expect(response.content).toBe('Test response');
            expect(mockFetch).toHaveBeenCalledTimes(2);
        }, 15000);

        it('should fail after max retries', async () => {
            mockFetch.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json'
                }
            })));

            await expect(provider.chat([testMessage])).rejects.toThrow(/Rate limit exceeded/);
            expect(mockFetch).toHaveBeenCalledTimes(2);
        }, 15000);
    });
});