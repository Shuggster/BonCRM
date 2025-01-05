interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

interface RateLimitConfig {
    requestsPerMinute: number;
    burstLimit: number;
    retryAfter: number;
}

export class RateLimiter {
    private buckets: Map<string, TokenBucket>;
    private configs: Map<string, RateLimitConfig>;

    constructor() {
        this.buckets = new Map();
        this.configs = new Map();
    }

    public setConfig(provider: string, config: RateLimitConfig): void {
        this.configs.set(provider, config);
        this.buckets.set(provider, {
            tokens: config.burstLimit,
            lastRefill: Date.now()
        });
    }

    private refillTokens(provider: string): void {
        const bucket = this.buckets.get(provider);
        const config = this.configs.get(provider);
        if (!bucket || !config) return;

        const now = Date.now();
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = Math.floor((timePassed / 60000) * config.requestsPerMinute);
        
        bucket.tokens = Math.min(config.burstLimit, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
    }

    public async checkLimit(provider: string): Promise<boolean> {
        const config = this.configs.get(provider);
        if (!config) {
            throw new Error(`Rate limit not configured for provider: ${provider}`);
        }

        this.refillTokens(provider);
        const bucket = this.buckets.get(provider)!;

        if (bucket.tokens > 0) {
            bucket.tokens--;
            return true;
        }

        return false;
    }

    public getRetryAfter(provider: string): number {
        const bucket = this.buckets.get(provider);
        const config = this.configs.get(provider);
        if (!bucket || !config) return 0;

        this.refillTokens(provider);
        if (bucket.tokens > 0) return 0;

        // Calculate time until next token is available
        const timeForOneToken = 60000 / config.requestsPerMinute;
        return Math.ceil(timeForOneToken);
    }

    public reset(provider: string): void {
        const config = this.configs.get(provider);
        if (!config) return;

        this.buckets.set(provider, {
            tokens: config.burstLimit,
            lastRefill: Date.now()
        });
    }
}

// Default configurations for each provider
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
    groq: {
        requestsPerMinute: 100,
        burstLimit: 120,    // Allow some burst capacity
        retryAfter: 1000    // Retry after 1 second by default
    },
    deepseek: {
        requestsPerMinute: 60,
        burstLimit: 70,     // Allow some burst capacity
        retryAfter: 2000    // Retry after 2 seconds by default
    },
    gemini: {
        requestsPerMinute: 60,
        burstLimit: 70,     // Allow some burst capacity
        retryAfter: 2000    // Retry after 2 seconds by default
    }
}; 