import { AIProvider, AIProviderOptions, BaseAIProvider } from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider extends BaseAIProvider {
    private model: string;
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super(apiKey, 'gemini');
        this.model = 'gemini-pro';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateResponse(prompt: string, options: AIProviderOptions = {}): Promise<string> {
        if (!prompt || prompt.trim() === '') {
            throw new Error('Empty prompt provided');
        }

        try {
            await this.checkRateLimit();
            
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbeddings(text: string): Promise<number[]> {
        try {
            await this.checkRateLimit();
            
            const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
            const result = await model.embedContent(text);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
        try {
            await this.checkRateLimit();
            
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Split the text into smaller chunks and emit them
            const words = text.split(' ');
            const chunkSize = 5; // Number of words per chunk
            
            for (let i = 0; i < words.length; i += chunkSize) {
                const chunk = words.slice(i, i + chunkSize).join(' ');
                onChunk(chunk);
                // Add a small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (error) {
            this.handleError(error);
        }
    }
} 