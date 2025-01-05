import { BaseProvider, ProviderConfig, ChatMessage, ChatResponse, EmbeddingResponse } from '../providers/base-provider';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

class TestProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  protected isRetryableError(error: Error): boolean {
    return error.message.includes('rate limit');
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    return this.withRetry(async () => ({
      content: 'test response',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    }));
  }

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    yield 'test';
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    return this.withRetry(async () => ({
      embedding: [0.1, 0.2, 0.3],
      usage: {
        promptTokens: 10,
        totalTokens: 10
      }
    }));
  }

  // Expose for testing
  public async testWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.withRetry(operation);
  }
}

describe('BaseProvider', () => {
  let provider: TestProvider;

  beforeEach(() => {
    provider = new TestProvider({
      apiKey: 'test-key',
      maxConcurrentRequests: 2
    });
  });

  it('should handle concurrent requests correctly', async () => {
    const promises = Array(3).fill(null).map(() => provider.chat([]));
    await expect(Promise.all(promises)).rejects.toThrow('Too many concurrent requests');
  });

  it('should retry on rate limit errors', async () => {
    const mockOperation = jest.fn<() => Promise<ChatResponse>>();
    mockOperation
      .mockRejectedValueOnce(new Error('rate limit exceeded'))
      .mockResolvedValueOnce({
        content: 'success',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }
      });

    const result = await provider.testWithRetry(mockOperation);
    expect(result.content).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockOperation = jest.fn<() => Promise<ChatResponse>>();
    mockOperation.mockRejectedValue(new Error('validation error'));

    await expect(provider.testWithRetry(mockOperation)).rejects.toThrow('validation error');
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should check availability correctly', async () => {
    const workingProvider = new TestProvider({ apiKey: 'test-key' });
    expect(await workingProvider.isAvailable()).toBe(true);

    const failingProvider = new TestProvider({ apiKey: 'invalid-key' });
    jest.spyOn(failingProvider, 'generateEmbedding').mockRejectedValue(new Error('API Error'));
    expect(await failingProvider.isAvailable()).toBe(false);
  });
}); 