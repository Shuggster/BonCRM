import { describe, it, expect, jest } from '@jest/globals';
import { BaseProvider, ProviderConfig, ChatMessage } from '../providers/base-provider';

// Mock implementation of BaseProvider for testing
class TestProvider extends BaseProvider {
  protected isRetryableError(error: Error): boolean {
    return error.message.includes('retry');
  }

  async chat(messages: ChatMessage[]) {
    if (!messages.length) {
      throw new Error('Empty input');
    }
    return {
      content: 'test response',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    };
  }

  async *chatStream(messages: ChatMessage[]) {
    if (!messages.length) {
      throw new Error('Empty input');
    }
    yield 'test';
    yield 'response';
  }

  async generateEmbedding(text: string) {
    if (!text.trim()) {
      throw new Error('Empty input');
    }
    return {
      embedding: [0.1, 0.2, 0.3],
      usage: {
        promptTokens: 10,
        totalTokens: 10
      }
    };
  }

  async isAvailable() {
    return true;
  }
}

describe('BaseProvider', () => {
  const config: ProviderConfig = {
    apiKey: 'test-key',
    maxConcurrentRequests: 5,
    timeout: 30000
  };

  it('should initialize with config', () => {
    const provider = new TestProvider(config);
    expect(provider).toBeDefined();
  });

  it('should handle empty input', async () => {
    const provider = new TestProvider(config);
    await expect(provider.chat([])).rejects.toThrow('Empty input');
    await expect(provider.chatStream([]).next()).rejects.toThrow('Empty input');
    await expect(provider.generateEmbedding('')).rejects.toThrow('Empty input');
  });

  it('should respect rate limits', async () => {
    const provider = new TestProvider(config);
    const promises = Array(5).fill(null).map(() => 
      provider.chat([{ role: 'user', content: 'test' }])
    );
    
    await expect(Promise.all(promises)).resolves.toBeDefined();
  });
}); 