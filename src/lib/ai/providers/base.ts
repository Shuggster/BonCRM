import { RetryHandler, RetryConfig } from '../utils/retry-handler';
import { RateLimiter } from '../utils/rate-limiter';

export interface ChatMessage {
    role: string;
    content: string;
}

export interface ChatResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface EmbeddingResponse {
    embedding: number[];
    usage: {
        promptTokens: number;
        totalTokens: number;
    };
}

export interface AIProviderConfig {
    apiKey: string;
    isTest?: boolean;
    retryConfig?: RetryConfig;
}

export interface AIProvider {
    chat(messages: ChatMessage[]): Promise<ChatResponse>;
    chatStream(messages: ChatMessage[]): AsyncGenerator<string>;
    generateEmbedding(text: string): Promise<EmbeddingResponse>;
    isAvailable(): Promise<boolean>;
}

export abstract class BaseProvider implements AIProvider {
    protected readonly retryHandler: RetryHandler;
    protected readonly rateLimiter: RateLimiter;
    protected readonly providerName: string;
    protected readonly config: AIProviderConfig;

    constructor(config: AIProviderConfig) {
        this.config = config;
        this.providerName = this.constructor.name;
        const isTest = config.isTest ?? false;
        
        this.retryHandler = new RetryHandler(config.retryConfig ?? {
            maxRetries: isTest ? 2 : 5,
            initialDelay: isTest ? 100 : 1000,
            maxDelay: isTest ? 500 : 10000,
            backoffFactor: 2,
            jitterFactor: 0.1
        });
        
        this.rateLimiter = new RateLimiter();
        this.rateLimiter.setConfig(this.providerName, {
            requestsPerMinute: isTest ? 2 : 10,
            burstLimit: isTest ? 3 : 12,
            retryAfter: isTest ? 500 : 10000
        });
    }

    abstract chat(messages: ChatMessage[]): Promise<ChatResponse>;
    abstract chatStream(messages: ChatMessage[]): AsyncGenerator<string>;
    abstract generateEmbedding(text: string): Promise<EmbeddingResponse>;

    async isAvailable(): Promise<boolean> {
        try {
            const canProceed = await this.rateLimiter.checkLimit(this.providerName);
            if (!canProceed) {
                const retryAfter = this.rateLimiter.getRetryAfter(this.providerName);
                throw new Error(`Rate limit exceeded. Retry after ${retryAfter}ms`);
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        return this.retryHandler.execute(async () => {
            const canProceed = await this.rateLimiter.checkLimit(this.providerName);
            if (!canProceed) {
                const retryAfter = this.rateLimiter.getRetryAfter(this.providerName);
                throw new Error(`Rate limit exceeded. Retry after ${retryAfter}ms`);
            }
            return operation();
        });
    }

    protected isRetryableError(error: any): boolean {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return message.includes('rate limit') || 
                   message.includes('server error') || 
                   message.includes('network error');
        }
        return false;
    }
} 