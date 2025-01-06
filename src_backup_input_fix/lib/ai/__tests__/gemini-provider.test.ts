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
    it('should handle streaming responses', async () => {
        const mockResponses = [
            { text: () => 'Hello' },
            { text: () => ' world' }
        ];

        const mockStream = {
            stream: {
                [Symbol.asyncIterator]: async function* () {
                    for (const response of mockResponses) {
                        yield response;
                    }
                }
            }
        };

        const mockModel = {
            generateContentStream: jest.fn().mockResolvedValue(mockStream)
        };

        const mockGenAI = {
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        };

        const provider = new GeminiProvider({
            apiKey: 'test-api-key',
            isTest: true
        });
        (provider as any).genAI = mockGenAI;

        const chunks: string[] = [];
        for await (const chunk of provider.chatStream([{ role: 'user', content: 'Hi' }])) {
            chunks.push(chunk);
        }

        expect(chunks).toEqual(['Hello', ' world']);
        expect(mockModel.generateContentStream).toHaveBeenCalled();
    });

    it('should handle streaming errors', async () => {
        const mockModel = {
            generateContentStream: jest.fn().mockRejectedValue(new Error('Rate limit exceeded'))
        };

        const mockGenAI = {
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        };

        const provider = new GeminiProvider({
            apiKey: 'test-api-key',
            isTest: true
        });
        (provider as any).genAI = mockGenAI;

        await expect(async () => {
            for await (const _ of provider.chatStream([{ role: 'user', content: 'Hi' }])) {
                // Do nothing
            }
        }).rejects.toThrow('Rate limit exceeded');
    });
  });
}); 