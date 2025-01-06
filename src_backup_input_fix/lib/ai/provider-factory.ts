import { AIProvider, AIProviderConfig } from './providers/base';
import { DeepseekProvider } from './providers/deepseek';
import { GroqProvider } from './providers/groq';
import { GeminiProvider } from './providers/gemini';

export type ProviderType = 'deepseek' | 'groq' | 'gemini';

export class AIProviderFactory {
    private static instance: AIProviderFactory;
    private providers: Map<string, AIProvider> = new Map();

    private constructor() {}

    static getInstance(): AIProviderFactory {
        if (!AIProviderFactory.instance) {
            AIProviderFactory.instance = new AIProviderFactory();
        }
        return AIProviderFactory.instance;
    }

    getProvider(type: ProviderType, config: AIProviderConfig): AIProvider {
        const key = `${type}-${config.apiKey}`;
        
        if (!this.providers.has(key)) {
            const provider = this.createProvider(type, config);
            this.providers.set(key, provider);
        }
        
        return this.providers.get(key)!;
    }

    private createProvider(type: ProviderType, config: AIProviderConfig): AIProvider {
        switch (type) {
            case 'deepseek':
                return new DeepseekProvider(config);
            case 'groq':
                return new GroqProvider(config);
            case 'gemini':
                return new GeminiProvider(config);
            default:
                throw new Error(`Unknown provider type: ${type}`);
        }
    }

    async getAvailableProvider(config: AIProviderConfig): Promise<AIProvider> {
        // Try providers in order of preference
        const providerTypes: ProviderType[] = ['deepseek', 'groq', 'gemini'];
        
        for (const type of providerTypes) {
            const provider = this.getProvider(type, config);
            if (await provider.isAvailable()) {
                return provider;
            }
        }
        
        throw new Error('No available AI providers found');
    }
}

// Export a singleton instance
export const providerFactory = AIProviderFactory.getInstance();