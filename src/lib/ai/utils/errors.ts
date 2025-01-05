export enum RetryableErrorType {
  RateLimit = 'RATE_LIMIT',
  Timeout = 'TIMEOUT',
  NetworkError = 'NETWORK_ERROR',
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',
  InternalServerError = 'INTERNAL_SERVER_ERROR'
}

export interface AIError extends Error {
  type?: RetryableErrorType;
  status?: number;
  retryable: boolean;
  provider: string;
}

export class ProviderError extends Error implements AIError {
  retryable: boolean;
  type?: RetryableErrorType;
  status?: number;
  provider: string;

  constructor(message: string, provider: string, options: {
    retryable?: boolean;
    type?: RetryableErrorType;
    status?: number;
  } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.retryable = options.retryable ?? false;
    this.type = options.type;
    this.status = options.status;
  }
}

export function isRetryableError(error: Error): boolean {
  if ((error as AIError).retryable) {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('rate limit') ||
    message.includes('quota exceeded') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('socket hang up') ||
    message.includes('service unavailable') ||
    (error as any).status === 429
  );
}

export function parseProviderError(error: any, provider: string): AIError {
  // Handle already parsed errors
  if (error instanceof ProviderError) {
    return error;
  }

  const message = error.message || error.error?.message || 'Unknown error';
  const status = error.status || error.error?.status;

  // Common error patterns
  if (status === 429 || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota')) {
    return new ProviderError(message, provider, {
      retryable: true,
      type: RetryableErrorType.RateLimit,
      status: 429
    });
  }

  if (message.toLowerCase().includes('timeout')) {
    return new ProviderError(message, provider, {
      retryable: true,
      type: RetryableErrorType.Timeout
    });
  }

  if (status >= 500) {
    return new ProviderError(message, provider, {
      retryable: true,
      type: RetryableErrorType.InternalServerError,
      status
    });
  }

  // Network errors
  if (
    message.toLowerCase().includes('econnreset') ||
    message.toLowerCase().includes('socket hang up') ||
    message.toLowerCase().includes('network')
  ) {
    return new ProviderError(message, provider, {
      retryable: true,
      type: RetryableErrorType.NetworkError
    });
  }

  // Default to non-retryable error
  return new ProviderError(message, provider, {
    retryable: false,
    status
  });
} 