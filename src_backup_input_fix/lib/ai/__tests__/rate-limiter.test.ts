import { RateLimiter, DEFAULT_RATE_LIMITS } from '../utils/rate-limiter';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
        jest.useFakeTimers();
        rateLimiter = new RateLimiter();
        // Configure with test limits
        rateLimiter.setConfig('test', {
            requestsPerMinute: 60,
            burstLimit: 70,
            retryAfter: 1000
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Basic Functionality', () => {
        it('should allow requests within rate limit', async () => {
            const results = await Promise.all(
                Array(5).fill(null).map(() => rateLimiter.checkLimit('test'))
            );
            expect(results.every(r => r === true)).toBe(true);
        });

        it('should block requests when limit exceeded', async () => {
            // Use up all tokens
            await Promise.all(
                Array(70).fill(null).map(() => rateLimiter.checkLimit('test'))
            );

            // Next request should be blocked
            const allowed = await rateLimiter.checkLimit('test');
            expect(allowed).toBe(false);
        });

        it('should refill tokens over time', async () => {
            // Use up some tokens
            await Promise.all(
                Array(10).fill(null).map(() => rateLimiter.checkLimit('test'))
            );

            // Advance time by 1 second
            jest.advanceTimersByTime(1000);

            // Should have new tokens available
            const allowed = await rateLimiter.checkLimit('test');
            expect(allowed).toBe(true);
        }, 10000); // Increased timeout
    });

    describe('Error Handling', () => {
        it('should throw error for unconfigured provider', async () => {
            await expect(rateLimiter.checkLimit('unknown'))
                .rejects
                .toThrow('Rate limit not configured for provider: unknown');
        });

        it('should handle reset correctly', () => {
            rateLimiter.reset('test');
            expect(rateLimiter.getRetryAfter('test')).toBe(0);
        });
    });

    describe('Default Configurations', () => {
        it('should have valid default configurations', () => {
            expect(DEFAULT_RATE_LIMITS.groq.requestsPerMinute).toBe(100);
            expect(DEFAULT_RATE_LIMITS.deepseek.requestsPerMinute).toBe(60);
            expect(DEFAULT_RATE_LIMITS.gemini.requestsPerMinute).toBe(60);
        });

        it('should work with default configurations', async () => {
            const limiter = new RateLimiter();
            limiter.setConfig('groq', DEFAULT_RATE_LIMITS.groq);

            const results = await Promise.all(
                Array(10).fill(null).map(() => limiter.checkLimit('groq'))
            );
            expect(results.every(r => r === true)).toBe(true);
        });
    });

    describe('Retry Timing', () => {
        it('should calculate correct retry time', async () => {
            // Use up all tokens
            await Promise.all(
                Array(70).fill(null).map(() => rateLimiter.checkLimit('test'))
            );

            const retryAfter = rateLimiter.getRetryAfter('test');
            expect(retryAfter).toBeGreaterThan(0);
            expect(retryAfter).toBeLessThanOrEqual(1000);
        });

        it('should return 0 retry time when tokens available', () => {
            const retryAfter = rateLimiter.getRetryAfter('test');
            expect(retryAfter).toBe(0);
        });
    });
}); 