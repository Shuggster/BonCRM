import { describe, it, expect, jest } from '@jest/globals';
import { providerFactory, ProviderType } from '../provider-factory';
import { AIProviderConfig } from '../providers/base';
import { DeepseekProvider } from '../providers/deepseek';
import { GroqProvider } from '../providers/groq';
import { GeminiProvider } from '../providers/gemini';

describe('AIProviderFactory', () => {
    const testConfig: AIProviderConfig = {
        apiKey: 'test-key',
        isTest: true,
        retryConfig: {
            maxRetries: 1,
            initialDelay: 1,
            maxDelay: 10,
            backoffFactor: 1,
            jitterFactor: 0
        }
    };

    it('should create singleton instance', () => {
        const instance1 = providerFactory;
        const instance2 = providerFactory;
        expect(instance1).toBe(instance2);
    });

    it('should create providers of correct type', () => {
        const deepseek = providerFactory.getProvider('deepseek', testConfig);
        const groq = providerFactory.getProvider('groq', testConfig);
        const gemini = providerFactory.getProvider('gemini', testConfig);

        expect(deepseek).toBeInstanceOf(DeepseekProvider);
        expect(groq).toBeInstanceOf(GroqProvider);
        expect(gemini).toBeInstanceOf(GeminiProvider);
    });

    it('should reuse provider instances', () => {
        const provider1 = providerFactory.getProvider('deepseek', testConfig);
        const provider2 = providerFactory.getProvider('deepseek', testConfig);
        expect(provider1).toBe(provider2);
    });

    it('should create separate instances for different API keys', () => {
        const provider1 = providerFactory.getProvider('deepseek', { ...testConfig, apiKey: 'key1' });
        const provider2 = providerFactory.getProvider('deepseek', { ...testConfig, apiKey: 'key2' });
        expect(provider1).not.toBe(provider2);
    });

    it('should throw error for unknown provider type', () => {
        expect(() => {
            // @ts-ignore - Testing invalid type
            providerFactory.getProvider('unknown' as ProviderType, testConfig);
        }).toThrow('Unknown provider type: unknown');
    });

    it('should get first available provider', async () => {
        const mockIsAvailable = jest.fn<() => Promise<boolean>>();
        mockIsAvailable
            .mockResolvedValueOnce(false)  // deepseek unavailable
            .mockResolvedValueOnce(true);  // groq available

        // Mock isAvailable for all provider instances
        jest.spyOn(DeepseekProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());
        jest.spyOn(GroqProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());
        jest.spyOn(GeminiProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());

        const provider = await providerFactory.getAvailableProvider(testConfig);
        expect(provider).toBeInstanceOf(GroqProvider);
        expect(mockIsAvailable).toHaveBeenCalledTimes(2);
    });

    it('should throw error when no providers available', async () => {
        const mockIsAvailable = jest.fn<() => Promise<boolean>>()
            .mockResolvedValue(false);

        // Mock isAvailable for all provider instances
        jest.spyOn(DeepseekProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());
        jest.spyOn(GroqProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());
        jest.spyOn(GeminiProvider.prototype, 'isAvailable')
            .mockImplementation(() => mockIsAvailable());

        await expect(providerFactory.getAvailableProvider(testConfig))
            .rejects
            .toThrow('No available AI providers found');
        
        expect(mockIsAvailable).toHaveBeenCalledTimes(3);
    });
}); 