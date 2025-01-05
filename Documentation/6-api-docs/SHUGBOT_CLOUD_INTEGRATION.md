# Shugbot Cloud Integration

## Overview
This document outlines the integration of Shugbot with various cloud services and AI providers. The system uses a modular approach to handle different AI providers and maintains a robust document processing pipeline.

## Quick Start
1. Set up environment variables in `.env.test` for testing or `.env` for development
2. Ensure Supabase project is running and accessible
3. Run tests to verify setup: `npm test src/lib/ai/__tests__/*.test.ts`

## Authentication
- Primary authentication handled through NextAuth.js with credentials provider
- User management through `public.users` table with role-based access
- Team membership managed in `public.team_members` with roles: 'leader' or 'member'
- Session validation required before any database operations

## Current Status
- ✅ Project setup complete
- ✅ Document processing implementation complete
- ✅ Vector store integration complete
- ✅ AI provider integrations complete with rate limiting:
  - Deepseek (Primary)
  - Groq (Secondary)
  - Gemini (Tertiary)
- ✅ Document chunking and embedding generation working
- ✅ Search functionality operational
- ✅ RLS policies configured for document access
- ✅ Test suite implemented and passing
- ✅ Retry mechanism implemented with full test coverage

## Implementation Details

### Document Processing
- Chunking algorithm optimized for:
  - Context preservation
  - Special character handling
  - Configurable chunk size and overlap
  - Minimum chunk length enforcement
- Embeddings stored as PostgreSQL vectors (1536 dimensions)
- Rate limiting implemented for all API providers
- Department-based access control

### Retry Mechanism
- Robust retry handler for API calls with:
  - Configurable max retries, delays, and backoff
  - Exponential backoff with jitter for optimal retry timing
  - Smart error classification for retryable vs non-retryable errors
  - Custom error classifier support
  - Comprehensive test coverage using Jest

Configuration options:
```typescript
interface RetryConfig {
  maxRetries: number;     // Maximum number of retry attempts
  initialDelay: number;   // Initial delay in milliseconds
  maxDelay: number;       // Maximum delay cap in milliseconds
  backoffFactor: number;  // Exponential backoff multiplier
  jitterFactor: number;   // Random jitter factor (0-1)
}
```

Default retryable errors:
- Rate limit exceeded
- Timeout
- Network error
- Server error
- Service unavailable

Testing considerations:
- Uses real timers for accurate delay testing
- Includes timeout settings for long-running tests
- Verifies attempt counting and error handling
- Validates custom error classification
- Ensures proper backoff and delay respect

### Database Schema
```sql
-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL,
    team_id UUID,
    is_private BOOLEAN DEFAULT false,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks table
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL,
    team_id UUID,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Providers
1. Deepseek (Primary)
   - Model: deepseek-chat
   - Embeddings: deepseek-embed
   - Full streaming support
   - Rate limited API calls

2. Groq (Secondary)
   - Model: mixtral-8x7b-32768
   - OpenAI-compatible embeddings
   - Full streaming support
   - Rate limited API calls

3. Gemini (Tertiary)
   - Model: gemini-pro
   - Embeddings: embedding-001
   - Simulated streaming support
   - Rate limited API calls

## Testing
### Test Files
- Provider tests: `src/lib/ai/__tests__/providers.test.ts`
- Document processing: `src/lib/ai/__tests__/chunking.test.ts`
- Search functionality: `src/lib/ai/__tests__/document-system.test.ts`
- Retry mechanism: `src/lib/ai/__tests__/retry-handler.test.ts`
  - Success scenarios
  - Failure handling
  - Error classification
  - Backoff timing
  - Custom error handling

### Test Environment
- Uses `.env.test` configuration
- Separate test database with clean data
- Automated setup and cleanup
- Mock session handling for authentication

### Common Test Issues
1. Environment Variables
   - Ensure all required variables are set in `.env.test`
   - Check Supabase URL and keys are correct
   - Verify AI provider API keys are valid

2. Database Setup
   - Tables must exist with correct schemas
   - Vector extension must be enabled
   - RLS policies must be configured

3. Test Data
   - User roles must be one of: 'admin', 'manager', 'operational'
   - Team member roles must be: 'leader' or 'member'
   - Department must be one of: 'management', 'sales', 'accounts', 'trade_shop'

## Troubleshooting
### Common Issues
1. Rate Limiting
   - Built-in rate limiting prevents quota exhaustion
   - Check rate limit configuration in `src/lib/ai/utils/rate-limiter.ts`

2. Embedding Format
   - PostgreSQL expects vector(1536)
   - Arrays are automatically converted to vectors
   - Vectors are returned as string arrays in queries

3. Permission Errors
   - Verify user session exists
   - Check user department matches document
   - Ensure team membership is correct

### Monitoring
- API call tracking in provider classes
- Rate limit monitoring through RateLimiter utility
- Error logging in all major operations

## Maintenance
1. Schema Changes
   - Document in `docs/supabase/`
   - Update types in `src/types/supabase.ts`
   - Run migrations in test environment first

2. AI Providers
   - Implement `AIProvider` interface
   - Add rate limiting configuration
   - Update provider factory

3. Testing
   - Add tests for new functionality
   - Verify existing tests pass
   - Update test data setup if needed 
   - Update test data setup if needed 