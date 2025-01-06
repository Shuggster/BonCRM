import { RetryHandler, RetryConfig } from '../utils/retry-handler';

export interface ProviderConfig {
  apiKey: string;
  retryConfig?: Partial<RetryConfig>;
  maxConcurrentRequests?: number;
  timeout?: number;
}

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

export interface AIProvider {
  chat(messages: ChatMessage[]): Promise<ChatResponse>;
  chatStream(messages: ChatMessage[]): AsyncGenerator<string>;
  generateEmbedding(text: string): Promise<EmbeddingResponse>;
  isAvailable(): Promise<boolean>;
}

export abstract class BaseProvider implements AIProvider {
  protected config: ProviderConfig;
  protected retryHandler: RetryHandler;
  protected activeRequests: number = 0;

  constructor(config: ProviderConfig) {
    this.config = {
      maxConcurrentRequests: 5,
      timeout: 30000,
      ...config
    };

    this.retryHandler = new RetryHandler(config.retryConfig);
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

  protected abstract isRetryableError(error: Error): boolean;
  
  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.retryHandler.execute(
      () => this.withConcurrencyLimit(operation),
      (error: Error) => this.isRetryableError(error) ? 'rate limit exceeded' : 'non_retryable'
    );
  }

  abstract chat(messages: ChatMessage[]): Promise<ChatResponse>;
  abstract chatStream(messages: ChatMessage[]): AsyncGenerator<string>;
  abstract generateEmbedding(text: string): Promise<EmbeddingResponse>;
  
  async isAvailable(): Promise<boolean> {
    try {
      await this.generateEmbedding('test');
      return true;
    } catch (error) {
      return false;
    }
  }
} 