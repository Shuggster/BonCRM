import { GeminiProvider } from '../providers/gemini-provider';
import { ChatMessage } from '../providers/base-provider';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn().mockImplementation(() => Promise.resolve({} as Response)) as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GeminiProvider({
      apiKey: mockApiKey,
      baseUrl: 'https://api.test.com/v1beta'
    });
    jest.clearAllMocks();
  });

  describe('chat', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' }
    ];

    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: 'Hello there!'
          }]
        }
      }],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 20,
        totalTokenCount: 30
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

      const expectedUrl = new URL('https://api.test.com/v1beta/models/gemini-pro:generateContent');
      expectedUrl.searchParams.append('key', mockApiKey);

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: 'Hello' }]
            }]
          })
        })
      );
    });

    it('should handle rate limit errors', async () => {
      mockFetch
        .mockImplementationOnce(() => Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: { message: 'quota exceeded' } })
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
        json: () => Promise.resolve({ error: { message: 'validation failed' } })
      } as unknown as Response));

      await expect(provider.chat(mockMessages)).rejects.toThrow('validation failed');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateEmbedding', () => {
    const mockResponse = {
      embedding: {
        values: [0.1, 0.2, 0.3]
      },
      usageMetadata: {
        tokenCount: 10
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

      const expectedUrl = new URL('https://api.test.com/v1beta/models/embedding-001:embedText');
      expectedUrl.searchParams.append('key', mockApiKey);

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: 'test text'
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
                value: new TextEncoder().encode(JSON.stringify({
                  candidates: [{
                    content: {
                      parts: [{ text: 'Hello' }]
                    }
                  }]
                }) + '\n')
              });
            case 2:
              return Promise.resolve({
                done: false,
                value: new TextEncoder().encode(JSON.stringify({
                  candidates: [{
                    content: {
                      parts: [{ text: ' there' }]
                    }
                  }]
                }) + '\n')
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

      const expectedUrl = new URL('https://api.test.com/v1beta/models/gemini-pro:streamGenerateContent');
      expectedUrl.searchParams.append('key', mockApiKey);

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: 'Hello' }]
            }]
          })
        })
      );
    });
  });
}); 