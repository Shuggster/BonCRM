import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DeepseekProvider } from '../providers/deepseek-provider';
import { GroqProvider } from '../providers/groq-provider';
import { GeminiProvider } from '../providers/gemini-provider';
import { AIProvider, AIProviderConfig, ChatMessage, ChatResponse } from '../providers/base';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('AI Providers Tests', () => {
    let providers: AIProvider[];
    let mockMessages: ChatMessage[];

    beforeEach(() => {
        // Reset mocks
        mockFetch.mockReset();
        jest.setTimeout(10000); // Increase timeout for streaming tests

        // Initialize test messages
        mockMessages = [
            { role: 'user', content: 'Test message' }
        ];

        // Initialize providers with test config
        const testConfig: AIProviderConfig = {
            apiKey: 'test-key',
            isTest: true,
            retryConfig: {
                maxRetries: 2,
                initialDelay: 100,
                maxDelay: 500,
                backoffFactor: 2,
                jitterFactor: 0.1
            },
            timeout: 5000 // Add explicit timeout for providers
        };

        providers = [
            new DeepseekProvider(testConfig),
            new GroqProvider(testConfig),
            new GeminiProvider(testConfig)
        ];
    });

    describe('Chat Tests', () => {
        it('should handle successful chat', async () => {
            const mockResponse: ChatResponse = {
                content: 'Test response',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            };

            // Mock responses for each provider format
            const mockResponses = {
                deepseek: {
                    choices: [{ message: { content: mockResponse.content } }],
                    usage: {
                        prompt_tokens: mockResponse.usage.promptTokens,
                        completion_tokens: mockResponse.usage.completionTokens,
                        total_tokens: mockResponse.usage.totalTokens
                    }
                },
                groq: {
                    choices: [{ message: { content: mockResponse.content } }],
                    usage: {
                        prompt_tokens: mockResponse.usage.promptTokens,
                        completion_tokens: mockResponse.usage.completionTokens,
                        total_tokens: mockResponse.usage.totalTokens
                    }
                },
                gemini: {
                    candidates: [{
                        content: {
                            parts: [{ text: mockResponse.content }]
                        }
                    }],
                    usageMetadata: {
                        promptTokenCount: mockResponse.usage.promptTokens,
                        candidatesTokenCount: mockResponse.usage.completionTokens,
                        totalTokenCount: mockResponse.usage.totalTokens
                    }
                }
            };

            for (const provider of providers) {
                mockFetch.mockImplementationOnce(() => {
                    const response = provider instanceof GeminiProvider ? mockResponses.gemini :
                                   provider instanceof GroqProvider ? mockResponses.groq :
                                   mockResponses.deepseek;

                    return Promise.resolve(new Response(JSON.stringify(response), {
                        status: 200,
                        headers: new Headers({ 'Content-Type': 'application/json' })
                    }));
                });

                const response = await provider.chat(mockMessages);
                expect(response).toEqual(mockResponse);
            }
        });

        it('should handle empty input', async () => {
            for (const provider of providers) {
                await expect(provider.chat([])).rejects.toThrow('Empty');
            }
        });

        it('should handle rate limits', async () => {
            mockFetch.mockImplementation(() => 
                Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                    status: 429,
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Retry-After': '1'
                    })
                }))
            );

            for (const provider of providers) {
                await expect(provider.chat(mockMessages))
                    .rejects.toThrow(/Rate limit exceeded/);
            }
        });
    });

    describe('Chat Stream Tests', () => {
        it('should handle streaming chat', async () => {
            const chunks = ['Hello', ' World'];
            
            for (const provider of providers) {
                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                    async start(controller) {
                        if (provider instanceof GeminiProvider) {
                            // Gemini format
                            for (const text of chunks) {
                                controller.enqueue(encoder.encode(JSON.stringify({
                                    candidates: [{
                                        content: {
                                            parts: [{ text }]
                                        }
                                    }]
                                }) + '\n'));
                                // Simulate some delay to test stream handling
                                await new Promise(resolve => setTimeout(resolve, 10));
                            }
                        } else {
                            // Deepseek/Groq format
                            for (const text of chunks) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                    choices: [{ delta: { content: text } }]
                                })}\n\n`));
                                // Simulate some delay to test stream handling
                                await new Promise(resolve => setTimeout(resolve, 10));
                            }
                            // Skip [DONE] for Groq as it doesn't handle it
                            if (!(provider instanceof GroqProvider)) {
                                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            }
                        }
                        controller.close();
                    },
                    cancel() {
                        // Stream cancellation handler
                    }
                });

                mockFetch.mockImplementationOnce(() => 
                    Promise.resolve(new Response(stream, {
                        status: 200,
                        headers: new Headers({
                            'Content-Type': provider instanceof GeminiProvider ? 'application/json' : 'text/event-stream'
                        })
                    }))
                );

                const receivedChunks: string[] = [];
                try {
                    for await (const chunk of provider.chatStream(mockMessages)) {
                        receivedChunks.push(chunk);
                    }
                } catch (error) {
                    fail(`Stream should not have errored: ${error}`);
                }

                expect(receivedChunks).toEqual(chunks);
                mockFetch.mockClear();
            }
        });

        it('should handle streaming errors', async () => {
            mockFetch.mockImplementation(() => 
                Promise.resolve(new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                    status: 500,
                    headers: new Headers({ 'Content-Type': 'application/json' })
                }))
            );

            for (const provider of providers) {
                let error: Error | undefined;
                try {
                    for await (const _ of provider.chatStream(mockMessages)) {
                        // Consume the stream
                    }
                } catch (e) {
                    error = e as Error;
                }
                expect(error).toBeDefined();
                expect(error?.message).toMatch(/Internal Server Error|HTTP error 500/);
            }
        });

        it('should handle rate limits during streaming', async () => {
            mockFetch.mockImplementation(() => 
                Promise.resolve(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                    status: 429,
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Retry-After': '1'
                    })
                }))
            );

            for (const provider of providers) {
                let error: Error | undefined;
                try {
                    for await (const _ of provider.chatStream(mockMessages)) {
                        // Consume the stream
                    }
                } catch (e) {
                    error = e as Error;
                }
                expect(error).toBeDefined();
                expect(error?.message).toMatch(/Rate limit exceeded/);
            }
        });

        it('should handle stream interruption', async () => {
            for (const provider of providers) {
                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                    async start(controller) {
                        controller.enqueue(encoder.encode(
                            provider instanceof GeminiProvider
                                ? JSON.stringify({
                                    candidates: [{
                                        content: {
                                            parts: [{ text: 'Initial chunk' }]
                                        }
                                    }]
                                }) + '\n'
                                : `data: ${JSON.stringify({
                                    choices: [{ delta: { content: 'Initial chunk' } }]
                                })}\n\n`
                        ));
                        // Simulate stream interruption
                        controller.error(new Error('Stream interrupted'));
                    },
                    cancel() {
                        // Stream cancellation handler
                    }
                });

                mockFetch.mockImplementationOnce(() => 
                    Promise.resolve(new Response(stream, {
                        status: 200,
                        headers: new Headers({
                            'Content-Type': provider instanceof GeminiProvider ? 'application/json' : 'text/event-stream'
                        })
                    }))
                );

                let error: Error | undefined;
                try {
                    for await (const _ of provider.chatStream(mockMessages)) {
                        // Consume the stream
                    }
                } catch (e) {
                    error = e as Error;
                }
                expect(error).toBeDefined();
                expect(error?.message).toMatch(/Stream interrupted/);
            }
        });
    });

    describe('Retry Logic Tests', () => {
        it('should retry on retryable errors', async () => {
            const mockResponse: ChatResponse = {
                content: 'Success after retry',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            };

            for (const provider of providers) {
                const mockApiResponse = provider instanceof GeminiProvider ? {
                    candidates: [{
                        content: {
                            parts: [{ text: mockResponse.content }]
                        }
                    }],
                    usageMetadata: {
                        promptTokenCount: mockResponse.usage.promptTokens,
                        candidatesTokenCount: mockResponse.usage.completionTokens,
                        totalTokenCount: mockResponse.usage.totalTokens
                    }
                } : {
                    choices: [{ message: { content: mockResponse.content } }],
                    usage: {
                        prompt_tokens: mockResponse.usage.promptTokens,
                        completion_tokens: mockResponse.usage.completionTokens,
                        total_tokens: mockResponse.usage.totalTokens
                    }
                };

                mockFetch
                    .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
                    .mockImplementationOnce(() => 
                        Promise.resolve(new Response(JSON.stringify(mockApiResponse), {
                            status: 200,
                            headers: new Headers({ 'Content-Type': 'application/json' })
                        }))
                    );

                const response = await provider.chat(mockMessages);
                expect(response).toEqual(mockResponse);
                expect(mockFetch).toHaveBeenCalledTimes(2);
                mockFetch.mockClear();
            }
        });

        it('should fail after max retries', async () => {
            mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

            for (const provider of providers) {
                await expect(provider.chat(mockMessages))
                    .rejects.toThrow('Network error');
                expect(mockFetch).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
                mockFetch.mockClear();
            }
        });
    });

    describe('Embedding Tests', () => {
        it('should generate embeddings', async () => {
            const mockEmbedding = {
                embedding: [0.1, 0.2, 0.3],
                usage: {
                    promptTokens: 10,
                    totalTokens: 10
                }
            };

            for (const provider of providers) {
                const mockApiResponse = provider instanceof GeminiProvider ? {
                    embedding: {
                        values: mockEmbedding.embedding
                    },
                    usageMetadata: {
                        tokenCount: mockEmbedding.usage.promptTokens
                    }
                } : {
                    data: [{ embedding: mockEmbedding.embedding }],
                    usage: {
                        prompt_tokens: mockEmbedding.usage.promptTokens,
                        total_tokens: mockEmbedding.usage.totalTokens
                    }
                };

                mockFetch.mockImplementationOnce(() => 
                    Promise.resolve(new Response(JSON.stringify(mockApiResponse), {
                        status: 200,
                        headers: new Headers({ 'Content-Type': 'application/json' })
                    }))
                );

                const response = await provider.generateEmbedding('Test text');
                expect(response).toEqual(mockEmbedding);
            }
        });

        it('should handle empty input for embeddings', async () => {
            for (const provider of providers) {
                await expect(provider.generateEmbedding('')).rejects.toThrow('Empty');
            }
        });
    });
});