import { RetryableErrorType, ProviderError, isRetryableError, parseProviderError } from '../utils/errors';

describe('Error Utilities', () => {
  describe('ProviderError', () => {
    it('should create error with default values', () => {
      const error = new ProviderError('test error', 'test-provider');
      expect(error.message).toBe('test error');
      expect(error.provider).toBe('test-provider');
      expect(error.retryable).toBe(false);
      expect(error.type).toBeUndefined();
      expect(error.status).toBeUndefined();
    });

    it('should create error with custom values', () => {
      const error = new ProviderError('rate limit', 'test-provider', {
        retryable: true,
        type: RetryableErrorType.RateLimit,
        status: 429
      });
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.RateLimit);
      expect(error.status).toBe(429);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors by property', () => {
      const error = new ProviderError('error', 'test', { retryable: true });
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify rate limit errors', () => {
      expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
      expect(isRetryableError(new Error('quota exceeded'))).toBe(true);
    });

    it('should identify network errors', () => {
      expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
      expect(isRetryableError(new Error('socket hang up'))).toBe(true);
    });

    it('should identify status code errors', () => {
      const error = new Error('error');
      (error as any).status = 429;
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new Error('validation failed'))).toBe(false);
    });
  });

  describe('parseProviderError', () => {
    it('should parse rate limit errors', () => {
      const error = parseProviderError({ message: 'rate limit exceeded' }, 'test-provider');
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.RateLimit);
      expect(error.status).toBe(429);
    });

    it('should parse timeout errors', () => {
      const error = parseProviderError({ message: 'request timeout' }, 'test-provider');
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.Timeout);
    });

    it('should parse network errors', () => {
      const error = parseProviderError({ message: 'socket hang up' }, 'test-provider');
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.NetworkError);
    });

    it('should parse server errors', () => {
      const error = parseProviderError({ status: 500, message: 'internal error' }, 'test-provider');
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.InternalServerError);
    });

    it('should handle nested error objects', () => {
      const error = parseProviderError({
        error: {
          message: 'rate limit exceeded',
          status: 429
        }
      }, 'test-provider');
      expect(error.retryable).toBe(true);
      expect(error.type).toBe(RetryableErrorType.RateLimit);
      expect(error.status).toBe(429);
    });

    it('should return non-retryable error for unknown errors', () => {
      const error = parseProviderError({ message: 'unknown error' }, 'test-provider');
      expect(error.retryable).toBe(false);
    });
  });
}); 