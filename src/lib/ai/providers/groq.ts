import { AIProvider, AIProviderOptions, BaseAIProvider } from './base';

export class GroqProvider extends BaseAIProvider {
    private model: string;
    private embedModel: string;

    constructor(apiKey: string) {
        super(apiKey, 'groq');
        this.baseUrl = 'https://api.groq.com/openai/v1';
        this.model = 'mixtral-8x7b-32768';
        this.embedModel = 'text-embedding-ada-002';  // Using OpenAI-compatible embeddings model
    }

    async generateResponse(prompt: string, options: AIProviderOptions = {}): Promise<string> {
        if (!prompt || prompt.trim() === '') {
            throw new Error('Empty prompt provided');
        }

        try {
            await this.checkRateLimit();
            
            console.log('Making request to https://api.groq.com/openai/v1/chat/completions');
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
                    stream: options.stream ?? false
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbeddings(text: string): Promise<number[]> {
        try {
            await this.checkRateLimit();
            
            const response = await fetch(`${this.baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.embedModel,
                    input: text
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.data[0].embedding;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
        try {
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
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

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
        } catch (error) {
            this.handleError(error);
        }
    }
} 