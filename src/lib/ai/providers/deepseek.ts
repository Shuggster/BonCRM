import { AIProvider, AIProviderOptions, BaseAIProvider } from './base';

export class DeepseekProvider extends BaseAIProvider {
    private model: string;
    private embedModel: string;

    constructor(apiKey: string) {
        super(apiKey, 'deepseek');
        this.baseUrl = 'https://api.deepseek.com/v1';
        this.model = 'deepseek-chat';
        this.embedModel = 'deepseek-embed';
    }

    async generateResponse(prompt: string, options: AIProviderOptions = {}): Promise<string> {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Empty prompt provided');
        }

        return this.executeWithRetry(async () => {
            await this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens ?? 1000,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }, 'generateResponse');
    }

    async generateEmbeddings(text: string): Promise<number[]> {
        if (!text || text.trim().length === 0) {
            throw new Error('Empty text provided for embeddings');
        }

        return this.executeWithRetry(async () => {
            await this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.embedModel,
                    input: text,
                    encoding_format: 'float'
                })
            });

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.data[0].embedding;
        }, 'generateEmbeddings');
    }

    async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Empty prompt provided');
        }

        await this.executeWithRetry(async () => {
            await this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body received');
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
                            const data = JSON.parse(line.slice(6));
                            if (data.choices[0].delta.content) {
                                onChunk(data.choices[0].delta.content);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        }, 'streamResponse');
    }
} 