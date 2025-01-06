# AI Testing Guide

## Last Known Working State
As of the latest update:

1. **Provider Implementations Consolidated**
   - Base provider interface consolidated in `base-provider.ts`
   - Rate limiting and retry handling implemented
   - Timeout configuration standardized
   - Error handling improved across all providers

2. **Working Provider Tests**
   - DeepseekProvider and GroqProvider tests passing
   - Rate limit handling verified
   - Error handling validated
   - Timeout issues resolved

3. **Remaining Issues**
   - GeminiProvider streaming implementation needs fixes
   - Reader lock handling requires additional error handling
   - Some timeout configurations may need adjustment

## Current Test Status

### ✅ Working Features
1. Rate Limit Handling
   - Proper error throwing for 429 status
   - Retry mechanism functioning
   - Error messages clear and descriptive

2. Provider Base Implementation
   - Consolidated interface
   - Standardized error handling
   - Improved configuration management

3. DeepseekProvider and GroqProvider
   - Basic functionality tests passing
   - Rate limit tests passing
   - Error handling verified

### ❌ Known Issues

1. **GeminiProvider Streaming**
   ```typescript
   // Current issue with reader lock
   reader.releaseLock()  // Throws TypeError in some cases
   ```
   - Need to implement proper reader lifecycle management
   - Add error handling for stream operations
   - Ensure proper cleanup of resources

2. **Test Timeouts**
   - Some tests may need increased timeout values
   - Consider environment-specific timeout configurations
   - Review concurrent request limits

### Next Steps

1. **Fix GeminiProvider**
   - [ ] Implement proper stream error handling
   - [ ] Add reader lock management
   - [ ] Test streaming edge cases

2. **Test Environment**
   - [ ] Review and adjust timeout configurations
   - [ ] Verify rate limit settings for all providers
   - [ ] Document any environment-specific settings

## Action Plan for Tomorrow
1. **Restore Working State**
   - [ ] Compare old and new provider implementations
   - [ ] Choose the most complete implementation
   - [ ] Remove duplicate files
   - [ ] Update all imports

2. **Fix Current Issues**
   - [ ] Resolve import path conflicts
   - [ ] Fix timeout issues
   - [ ] Fix stream handling in Gemini provider

3. **Verify and Document**
   - [ ] Run all tests
   - [ ] Document any changes made
   - [ ] Update this guide with final working setup

## Test Setup Guide

1. **Environment Setup**
   ```bash
   # Create test environment file
   cp .env.example .env.test
   
   # Install dependencies
   npm install
   
   # Run tests
   npm test
   ```

2. **Required Test Keys**
   ```env
   DEEPSEEK_API_KEY=your_test_key
   GROQ_API_KEY=your_test_key
   GEMINI_API_KEY=your_test_key
   ```

3. **Jest Configuration**
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     setupFilesAfterEnv: ['<rootDir>/src/lib/ai/__tests__/setup.ts'],
     testTimeout: 30000  // Increased timeout for async tests
   };
   ```

## Test Categories

### 1. Provider Tests
- Chat functionality
- Streaming responses
- Embedding generation
- Rate limiting
- Error handling

### 2. Rate Limiting Tests
- Request throttling
- Token bucket refill
- Burst handling
- Provider-specific limits

### 3. Retry Logic Tests
- Exponential backoff
- Error classification
- Maximum retry attempts
- Timeout handling

### 4. Integration Tests
- Multi-provider fallback
- Document processing
- Embedding generation
- Stream handling

## Best Practices

1. **Mocking**
   ```typescript
   // Mock fetch globally
   const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
   global.fetch = mockFetch;
   
   // Mock response
   mockFetch.mockResolvedValueOnce(new Response(
     JSON.stringify(mockResponse),
     { status: 200, headers: { 'Content-Type': 'application/json' } }
   ));
   ```

2. **Async Testing**
   ```typescript
   it('should handle async operations', async () => {
     // Use longer timeout for async tests
   }, 30000);
   ```

3. **Stream Testing**
   ```typescript
   // Mock stream response
   const stream = new ReadableStream({
     start(controller) {
       controller.enqueue(encoder.encode('data: {"content":"test"}\n\n'));
       controller.close();
     }
   });
   ```

## TODO List

1. **Fix Import Issues**
   - [ ] Update all provider imports to use new paths
   - [ ] Fix BaseAIProvider extension issues
   - [ ] Update provider factory imports

2. **Fix Timeout Issues**
   - [ ] Add proper timeouts to all async tests
   - [ ] Implement proper test cleanup
   - [ ] Use fake timers where appropriate

3. **Fix Stream Handling**
   - [ ] Fix Gemini provider stream issues
   - [ ] Implement proper stream mocking
   - [ ] Add stream cleanup

4. **Add Missing Tests**
   - [ ] Document chunking tests
   - [ ] Provider fallback tests
   - [ ] Error recovery tests

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/lib/ai/__tests__/deepseek-provider.test.ts

# Run with increased timeout
npm test -- --testTimeout=30000

# Run with coverage
npm test -- --coverage
```

## Debugging Tests

1. Use Jest's debug mode:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

2. Add console logs in setup:
   ```typescript
   beforeAll(() => {
     console.log('🧪 Test Environment initialized');
   });
   ```

3. Check test environment:
   ```typescript
   console.log('Environment:', {
     NODE_ENV: process.env.NODE_ENV,
     IS_TEST: process.env.IS_TEST_ENV
   });
   ```

## Common Issues and Solutions

1. **Timeout Errors**
   - Increase test timeout
   - Use fake timers
   - Properly mock async operations

2. **Import Errors**
   - Check file paths
   - Verify module exports
   - Update tsconfig paths

3. **Stream Errors**
   - Properly mock ReadableStream
   - Implement stream cleanup
   - Handle stream errors

4. **Rate Limit Issues**
   - Use fake timers
   - Mock rate limit responses
   - Implement proper delays

## Implementation Analysis

### Base Provider Comparison

1. **Old Implementation (`base-provider.ts`)**
   ```typescript
   interface ProviderConfig {
     apiKey: string;
     retryConfig?: Partial<RetryConfig>;
     maxConcurrentRequests?: number;
     timeout?: number;
   }
   
   interface ChatMessage {
     role: 'system' | 'user' | 'assistant';  // Stricter typing
     content: string;
   }
   ```
   - ✅ Stricter type safety
   - ✅ Simpler implementation
   - ✅ Working tests
   - ❌ Manual request counting

2. **New Implementation (`base.ts`)**
   ```typescript
   interface AIProviderConfig {
     apiKey: string;
     isTest?: boolean;
     retryConfig?: RetryConfig;
   }
   
   interface ChatMessage {
     role: string;  // More flexible
     content: string;
   }
   ```
   - ✅ Better rate limiting (uses RateLimiter)
   - ✅ Test mode support
   - ❌ Less type safety
   - ❌ Breaking changes in tests

### Recommendation

Based on the analysis, we should:

1. **Keep Old Implementation** because:
   - Tests are already working with it
   - Stricter type safety is better
   - Simpler to understand and maintain

2. **Port New Features**:
   - Add `RateLimiter` integration
   - Add test mode support
   - Keep strict typing

3. **Update Tests**:
   - Use the old file paths
   - Add new test cases for rate limiting
   - Keep existing timeout values

4. **Clean Up**:
   - Remove new implementation files
   - Update all imports
   - Document the decision

## Action Plan for Next 30 Minutes

1. **Clean Up Files**
   - [ ] Remove `base.ts`
   - [ ] Remove `deepseek.ts`, `groq.ts`, etc.
   - [ ] Keep `*-provider.ts` files

2. **Update Imports**
   - [ ] Fix all test imports
   - [ ] Update provider factory
   - [ ] Fix any broken references

3. **Run Tests**
   - [ ] Clear Jest cache
   - [ ] Run with increased timeout
   - [ ] Fix any remaining issues
``` 