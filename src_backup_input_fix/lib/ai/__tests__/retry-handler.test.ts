import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { RetryHandler } from '../utils/retry-handler';
import { RateLimitError } from '../utils/errors';

describe('RetryHandler', () => {
    let retryHandler: RetryHandler;
    let attempts: number;

    beforeEach(() => {
        attempts = 0;
        retryHandler = new RetryHandler({
            maxRetries: 2,
            initialDelay: 100,
            maxDelay: 500,
            backoffFactor: 2,
            jitterFactor: 0.1
        });
    });

    it('should succeed on the first attempt', async () => {
        const mockFn = jest.fn<() => Promise<string>>().mockResolvedValue('success');
        const result = await retryHandler.execute(mockFn);
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should succeed after a few retries', async () => {
        const mockFn = jest.fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('rate limit exceeded'))
            .mockRejectedValueOnce(new Error('rate limit exceeded'))
            .mockResolvedValue('success');

        const result = await retryHandler.execute(mockFn);
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw an error after all retries are exhausted', async () => {
        const mockFn = jest.fn<() => Promise<unknown>>()
            .mockRejectedValue(new Error('rate limit exceeded'));

        await expect(retryHandler.execute(mockFn)).rejects.toThrow('rate limit exceeded');
        expect(mockFn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should not retry if maxRetries is set to 0', async () => {
        const noRetryHandler = new RetryHandler({
            maxRetries: 0,
            initialDelay: 100,
            maxDelay: 500,
            backoffFactor: 2,
            jitterFactor: 0.1
        });

        const mockFn = jest.fn<() => Promise<unknown>>()
            .mockRejectedValue(new Error('rate limit exceeded'));

        await expect(noRetryHandler.execute(mockFn)).rejects.toThrow('rate limit exceeded');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect backoff and jitter settings', async () => {
        const start = Date.now();
        await retryHandler.execute(async () => {
            if (attempts++ < 2) {
                throw new RateLimitError('Rate limit exceeded');
            }
            return 'success';
        });
        const duration = Date.now() - start;

        // With initial delay of 100ms and backoff factor of 2,
        // we expect at least: 100ms + 200ms = 300ms, but allow for some timing variance
        expect(duration).toBeGreaterThanOrEqual(250);
    });

    it('should respect max delay setting', async () => {
        const maxDelayHandler = new RetryHandler({
            maxRetries: 3,
            initialDelay: 100,
            maxDelay: 150, // Set max delay lower than what backoff would calculate
            backoffFactor: 2,
            jitterFactor: 0
        });

        const mockFn = jest.fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('rate limit exceeded'))
            .mockRejectedValueOnce(new Error('rate limit exceeded'))
            .mockRejectedValueOnce(new Error('rate limit exceeded'))
            .mockResolvedValue('success');

        const startTime = Date.now();
        await maxDelayHandler.execute(mockFn);
        const duration = Date.now() - startTime;

        // With max delay of 150ms, we expect at most: 150ms * 3 = 450ms
        expect(duration).toBeLessThanOrEqual(500); // Add some buffer for test execution
    });

    it('should not retry on non-retryable errors', async () => {
        const mockFn = jest.fn<() => Promise<unknown>>()
            .mockRejectedValue(new Error('validation error'));

        await expect(retryHandler.execute(mockFn)).rejects.toThrow('validation error');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use custom error classifier if provided', async () => {
        const mockFn = jest.fn<() => Promise<unknown>>()
            .mockRejectedValue(new Error('custom error'));

        const customClassifier = (error: Error) => 
            error.message === 'custom error' ? 'rate limit exceeded' : error.message;

        await expect(retryHandler.execute(mockFn, customClassifier)).rejects.toThrow('custom error');
        expect(mockFn).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });
}); 