import { RateLimitError, ValidationError } from '../utils/errors';
import { AIProvider, AIProviderConfig, BaseProvider, ChatMessage, ChatResponse, EmbeddingResponse } from './base';

export class DeepseekProvider extends BaseProvider implements AIProvider {
    private readonly endpoint = 'https://api.deepseek.com/v1';
    private readonly model = 'deepseek-chat';
    private readonly embeddingModel = 'deepseek-embed';

    constructor(config: AIProviderConfig) {
        super(config);
        if (!this.apiKey) {
            throw new ValidationError('API key is required for Deepseek provider');
        }
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        if (!messages?.length) {
            throw new ValidationError('No messages provided');
        }

        const response = await this.withConcurrencyLimit(async () => {
            const response = await fetch(`${this.endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    model: this.model,
                    temperature: 0.7,
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    const error = new RateLimitError('Rate limit exceeded');
                    error.retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
                    throw error;
                }
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                },
            };
        });

        return response;
    }

    async *chatStream(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
        if (!messages?.length) {
            throw new ValidationError('No messages provided');
        }

        const response = await fetch(`${this.endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
                model: this.model,
                temperature: 0.7,
                max_tokens: 1000,
                stream: true,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                const error = new RateLimitError('Rate limit exceeded');
                error.retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
                throw error;
            }
            throw new Error(`${response.status} ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            console.error('Error parsing streaming response:', e);
                        }
                    }
                }
            }
        } finally {
            try {
                reader.releaseLock();
            } catch (e) {
                console.error('Error releasing reader lock:', e);
            }
        }
    }

    async generateEmbedding(text: string): Promise<EmbeddingResponse> {
        if (!text || text.trim().length === 0) {
            throw new ValidationError('Empty text provided for embeddings');
        }

        const response = await this.withConcurrencyLimit(async () => {
            const response = await fetch(`${this.endpoint}/embeddings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: text,
                    model: this.embeddingModel,
                    encoding_format: 'float',
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    const error = new RateLimitError('Rate limit exceeded');
                    error.retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
                    throw error;
                }
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                embedding: data.data[0].embedding,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    totalTokens: data.usage.total_tokens,
                },
            };
        });

        return response;
    }
} 