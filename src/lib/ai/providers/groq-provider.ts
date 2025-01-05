import { BaseProvider, ProviderConfig, ChatMessage, ChatResponse, EmbeddingResponse } from './base-provider';
import { parseProviderError } from '../utils/errors';

interface GroqConfig extends ProviderConfig {
  model?: string;
  embeddingModel?: string;
  baseUrl?: string;
}

interface GroqChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GroqEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class GroqProvider extends BaseProvider {
  protected override config: GroqConfig;

  constructor(config: GroqConfig) {
    super(config);
    this.config = {
      model: 'mixtral-8x7b-32768',
      embeddingModel: 'llama2-70b-4096',
      baseUrl: 'https://api.groq.com/v1',
      ...config
    };
  }

  protected isRetryableError(error: Error): boolean {
    const parsedError = parseProviderError(error, 'groq');
    return parsedError.retryable;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw parseProviderError({
        message: error.error || `HTTP error ${response.status}`,
        status: response.status
      }, 'groq');
    }

    return response.json();
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!messages.length || !messages[messages.length - 1].content.trim()) {
      throw new Error('Empty prompt');
    }

    return this.withRetry(async () => {
      const response = await this.makeRequest<GroqChatResponse>('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false
        })
      });

      return {
        content: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        }
      };
    });
  }

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!messages.length || !messages[messages.length - 1].content.trim()) {
      throw new Error('Empty prompt');
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw parseProviderError({
        message: error.error || `HTTP error ${response.status}`,
        status: response.status
      }, 'groq');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.choices?.[0]?.delta?.content) {
            yield data.choices[0].delta.content;
          }
        }
      }
    }
  }

  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text');
    }

    return this.withRetry(async () => {
      const response = await this.makeRequest<GroqEmbeddingResponse>('/embeddings', {
        method: 'POST',
        body: JSON.stringify({
          model: this.config.embeddingModel,
          input: text
        })
      });

      return {
        embedding: response.data[0].embedding,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens
        }
      };
    });
  }
} 