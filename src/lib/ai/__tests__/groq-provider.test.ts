import { GroqProvider } from '../providers/groq-provider';
import { ChatMessage } from '../providers/base-provider';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn().mockImplementation(() => Promise.resolve({} as Response)) as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('GroqProvider', () => {
  let provider: GroqProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GroqProvider({
      apiKey: mockApiKey,
      baseUrl: 'https://api.test.com/v1'
    });
    jest.clearAllMocks();
  });

  describe('chat', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' }
    ];

    const mockResponse = {
      choices: [{
        message: {
          content: 'Hello there!'
        }
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    };

    it('should make a successful chat request', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as unknown as Response));

      const result = await provider.chat(mockMessages);

      expect(result).toEqual({
        content: 'Hello there!',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: mockMessages,
            stream: false
          })
        })
      );
    });

    it('should handle rate limit errors', async () => {
      mockFetch
        .mockImplementationOnce(() => Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'rate limit exceeded' })
        } as unknown as Response))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        } as unknown as Response));

      const result = await provider.chat(mockMessages);
      expect(result.content).toBe('Hello there!');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw on non-retryable errors', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'validation failed' })
      } as unknown as Response));

      await expect(provider.chat(mockMessages)).rejects.toThrow('validation failed');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateEmbedding', () => {
    const mockResponse = {
      data: [{
        embedding: [0.1, 0.2, 0.3]
      }],
      usage: {
        prompt_tokens: 10,
        total_tokens: 10
      }
    };

    it('should generate embeddings successfully', async () => {
      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as unknown as Response));

      const result = await provider.generateEmbedding('test text');

      expect(result).toEqual({
        embedding: [0.1, 0.2, 0.3],
        usage: {
          promptTokens: 10,
          totalTokens: 10
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/embeddings',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama2-70b-4096',
            input: 'test text'
          })
        })
      );
    });
  });

  describe('chatStream', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' }
    ];

    it('should handle streaming responses', async () => {
      let callCount = 0;
      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          callCount++;
          switch (callCount) {
            case 1:
              return Promise.resolve({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
              });
            case 2:
              return Promise.resolve({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" there"}}]}\n\n')
              });
            default:
              return Promise.resolve({
                done: true,
                value: undefined
              });
          }
        })
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      } as unknown as Response));

      const chunks: string[] = [];
      for await (const chunk of provider.chatStream(mockMessages)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' there']);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: mockMessages,
            stream: true
          })
        })
      );
    });
  });
}); 