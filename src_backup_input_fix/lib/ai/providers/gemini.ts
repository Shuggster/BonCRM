import { RateLimitError, ValidationError } from '../utils/errors';
import { AIProvider, AIProviderConfig, BaseProvider, ChatMessage, ChatResponse, EmbeddingResponse } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider extends BaseProvider implements AIProvider {
    private readonly genAI: GoogleGenerativeAI;
    private readonly model = 'gemini-pro';
    private readonly embeddingModel = 'embedding-001';

    constructor(config: AIProviderConfig) {
        super(config);
        if (!this.apiKey) {
            throw new ValidationError('API key is required for Gemini provider');
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        if (!messages?.length) {
            throw new ValidationError('No messages provided');
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const prompt = messages.map(msg => msg.content).join('\n');
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return {
                content: response.text(),
                usage: {
                    promptTokens: 0, // Gemini doesn't provide token counts
                    completionTokens: 0,
                    totalTokens: 0,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toLowerCase().includes('rate limit')) {
                    const rateLimitError = new RateLimitError('Rate limit exceeded');
                    rateLimitError.retryAfter = 60;
                    throw rateLimitError;
                }
            }
            throw error;
        }
    }

    async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
        if (!messages?.length) {
            throw new ValidationError('No messages provided');
        }

        let result;
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const prompt = messages.map(msg => msg.content).join('\n');
            result = await model.generateContentStream(prompt);

            for await (const chunk of result.stream) {
                try {
                    if (chunk.text) {
                        yield chunk.text();
                    }
                } catch (chunkError) {
                    console.error('Error processing chunk:', chunkError);
                    throw chunkError;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toLowerCase().includes('rate limit')) {
                    const rateLimitError = new RateLimitError('Rate limit exceeded');
                    rateLimitError.retryAfter = 60;
                    throw rateLimitError;
                }
            }
            throw error;
        } finally {
            if (result?.stream) {
                try {
                    // Ensure we properly close the stream
                    await result.stream.cancel();
                } catch (cleanupError) {
                    console.error('Error cleaning up stream:', cleanupError);
                }
            }
        }
    }

    async generateEmbedding(text: string): Promise<EmbeddingResponse> {
        if (!text || text.trim().length === 0) {
            throw new ValidationError('Empty text provided for embeddings');
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
            const result = await model.embedContent(text);
            const embedding = result.embedding.values;

            return {
                embedding,
                usage: {
                    promptTokens: 0, // Gemini doesn't provide token counts
                    totalTokens: 0,
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.toLowerCase().includes('rate limit')) {
                    const rateLimitError = new RateLimitError('Rate limit exceeded');
                    rateLimitError.retryAfter = 60;
                    throw rateLimitError;
                }
            }
            throw error;
        }
    }
} 