import { RetryHandler, RetryConfig } from '../utils/retry-handler';
import { RateLimiter } from '../utils/rate-limiter';
import { RateLimitError } from '../utils/errors';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
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
    maxConcurrentRequests?: number;
    timeout?: number;
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
    protected activeRequests: number = 0;
    protected readonly apiKey: string;
    protected readonly maxConcurrentRequests: number;
    protected readonly timeout: number;

    constructor(config: AIProviderConfig) {
        this.config = {
            maxConcurrentRequests: config.isTest ? 2 : 5,
            timeout: config.isTest ? 5000 : 30000,
            ...config
        };
        this.providerName = this.constructor.name;
        
        this.retryHandler = new RetryHandler(config.retryConfig ?? {
            maxRetries: config.isTest ? 2 : 5,
            initialDelay: config.isTest ? 100 : 1000,
            maxDelay: config.isTest ? 500 : 10000,
            backoffFactor: 2,
            jitterFactor: 0.1
        });
        
        this.rateLimiter = new RateLimiter();
        this.rateLimiter.setConfig(this.providerName, {
            requestsPerMinute: config.isTest ? 2 : 10,
            burstLimit: config.isTest ? 3 : 12,
            retryAfter: config.isTest ? 500 : 10000
        });

        this.apiKey = config.apiKey;
        this.maxConcurrentRequests = config.maxConcurrentRequests || 10;
        this.timeout = config.timeout || 30000;
    }

    protected async withConcurrencyLimit<T>(operation: () => Promise<T>): Promise<T> {
        if (this.activeRequests >= this.config.maxConcurrentRequests!) {
            throw new Error('Too many concurrent requests');
        }

        this.activeRequests++;
        try {
            return await operation();
        } finally {
            this.activeRequests--;
        }
    }

    protected isRetryableError(error: Error): boolean {
        return (error instanceof RateLimitError) ||
            Boolean(error.message?.toLowerCase().includes('rate limit')) ||
            Boolean(error.message?.toLowerCase().includes('timeout'));
    }
    
    protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        return this.retryHandler.execute(
            () => this.withConcurrencyLimit(operation),
            (error: Error) => this.isRetryableError(error) ? 'rate_limit_exceeded' : 'non_retryable'
        );
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
} 