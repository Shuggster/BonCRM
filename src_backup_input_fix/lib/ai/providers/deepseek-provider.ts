import { BaseProvider, ProviderConfig, ChatMessage, ChatResponse, EmbeddingResponse } from './base-provider';

interface DeepseekConfig extends ProviderConfig {
    model?: string;
    embeddingModel?: string;
    baseUrl?: string;
}

export class DeepseekProvider extends BaseProvider {
    private readonly model: string;
    private readonly embeddingModel: string;
    private readonly baseUrl: string;

    constructor(config: DeepseekConfig) {
        super(config);
        this.model = config.model ?? 'deepseek-chat';
        this.embeddingModel = config.embeddingModel ?? 'deepseek-embed';
        this.baseUrl = config.baseUrl ?? 'https://api.deepseek.com/v1';
    }

    protected isRetryableError(error: Error): boolean {
        return error.message.toLowerCase().includes('rate limit') ||
               error.message.toLowerCase().includes('server error') ||
               error.message.toLowerCase().includes('network error');
    }

    async chat(messages: ChatMessage[]): Promise<ChatResponse> {
        if (!messages.length || !messages[messages.length - 1].content.trim()) {
            throw new Error('Empty prompt');
        }

        return this.withRetry(async () => {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    stream: false
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                }
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens
                }
            };
        });
    }

    async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
        if (!messages.length || !messages[messages.length - 1].content.trim()) {
            throw new Error('Empty prompt');
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: true
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            }
            throw new Error(`HTTP error ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                yield data.choices[0].delta.content;
                            }
                        } catch (e) {
                            // Skip invalid JSON
                            continue;
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    async generateEmbedding(text: string): Promise<EmbeddingResponse> {
        if (!text || text.trim().length === 0) {
            throw new Error('Empty text');
        }

        return this.withRetry(async () => {
            const response = await fetch(`${this.baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.embeddingModel,
                    input: text
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                }
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            return {
                embedding: data.data[0].embedding,
                usage: {
                    promptTokens: data.usage.prompt_tokens,
                    totalTokens: data.usage.total_tokens
                }
            };
        });
    }
} 