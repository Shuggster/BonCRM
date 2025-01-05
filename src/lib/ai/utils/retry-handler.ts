export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitterFactor: number;
}

export class RetryHandler {
  public config: RetryConfig;
  public retryableErrors: Set<string>;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffFactor: 2,
      jitterFactor: 0.1,
      ...config
    };

    this.retryableErrors = new Set([
      'rate limit exceeded',
      'timeout',
      'network error',
      'server error',
      'service unavailable'
    ]);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt);
    const jitter = baseDelay * this.config.jitterFactor * (Math.random() * 2 - 1);
    return Math.min(baseDelay + jitter, this.config.maxDelay);
  }

  public async execute<T>(
    operation: () => Promise<T>,
    errorClassifier?: (error: Error) => string
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const errorType = errorClassifier?.(lastError) || this.classifyError(lastError);

        // For non-retryable errors or last attempt, throw immediately
        if (!this.retryableErrors.has(errorType) || attempt === this.config.maxRetries) {
          throw lastError;
        }

        await this.sleep(this.calculateDelay(attempt));
        attempt++;
      }
    }

    // This should never happen, but TypeScript needs it
    throw lastError || new Error('Unexpected end of retry loop');
  }

  public classifyError(error: Error): string {
    return error.message.toLowerCase();
  }
} 