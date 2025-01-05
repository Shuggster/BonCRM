import { BaseProvider, ProviderConfig, ChatMessage, ChatResponse, EmbeddingResponse } from './base-provider';
import { parseProviderError } from '../utils/errors';

interface GeminiConfig extends ProviderConfig {
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
}

interface GeminiChatResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiEmbeddingResponse {
  embedding: {
    values: number[];
  };
  usageMetadata: {
    tokenCount: number;
  };
}

export class GeminiProvider extends BaseProvider {
  protected override config: GeminiConfig;

  constructor(config: GeminiConfig) {
    super(config);
    this.config = {
      model: 'gemini-pro',
      embeddingModel: 'embedding-001',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      ...config
    };
  }

  protected isRetryableError(error: Error): boolean {
    const parsedError = parseProviderError(error, 'gemini');
    return parsedError.retryable;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.config.apiKey);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw parseProviderError({
        message: error.error?.message || error.error || `HTTP error ${response.status}`,
        status: response.status
      }, 'gemini');
    }

    return response.json();
  }

  private formatMessages(messages: ChatMessage[]): any {
    return {
      contents: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      }))
    };
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!messages.length || !messages[messages.length - 1].content.trim()) {
      throw new Error('Empty prompt');
    }

    return this.withRetry(async () => {
      const response = await this.makeRequest<GeminiChatResponse>(
        `/models/${this.config.model}:generateContent`,
        {
          method: 'POST',
          body: JSON.stringify(this.formatMessages(messages))
        }
      );

      return {
        content: response.candidates[0].content.parts[0].text,
        usage: {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount
        }
      };
    });
  }

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!messages.length || !messages[messages.length - 1].content.trim()) {
      throw new Error('Empty prompt');
    }

    const url = new URL(`${this.config.baseUrl}/models/${this.config.model}:streamGenerateContent`);
    url.searchParams.append('key', this.config.apiKey);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.formatMessages(messages))
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw parseProviderError({
        message: error.error?.message || error.error || `HTTP error ${response.status}`,
        status: response.status
      }, 'gemini');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield data.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } catch (error: any) {
      throw parseProviderError({
        message: error?.message || 'Stream error',
        status: 500
      }, 'gemini');
    } finally {
      reader.releaseLock();
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text');
    }

    return this.withRetry(async () => {
      const response = await this.makeRequest<GeminiEmbeddingResponse>(
        `/models/${this.config.embeddingModel}:embedText`,
        {
          method: 'POST',
          body: JSON.stringify({
            text
          })
        }
      );

      return {
        embedding: response.embedding.values,
        usage: {
          promptTokens: response.usageMetadata.tokenCount,
          totalTokens: response.usageMetadata.tokenCount
        }
      };
    });
  }
} 