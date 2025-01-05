# SHUGBOT Cloud Integration

## Overview
SHUGBOT is a cloud-based document processing and AI integration system that provides secure, scalable document management with advanced AI capabilities.

## Quick Start
1. Clone the repository
2. Copy `.env.example` to `.env.test` for testing environment
3. Set up your Supabase instance and configure environment variables
4. Run `npm install` to install dependencies
5. Run `npm test` to verify the setup

## Current Status
✅ Document processing pipeline fully implemented and tested
✅ Test suite passing with comprehensive coverage
✅ Rate limiting implemented and verified
✅ Team member roles properly enforced ('leader' or 'member')
✅ Embedding generation and storage working correctly
✅ Special character handling improved
✅ Error handling and validation enhanced
✅ Batch processing with progress tracking implemented
✅ Performance optimizations for parallel processing

## Authentication
- Supabase authentication integrated
- Role-based access control implemented
- Department-based data isolation enforced

## Implementation Architecture
### Document Processing
- Chunks are processed with proper overlap
- Embeddings are stored in PostgreSQL vector format
- Rate limiting prevents API overload
- Special characters are preserved during processing
- Batch processing supports concurrent document handling
- Progress tracking provides real-time status updates
- Automatic retries for rate-limited requests
- Configurable concurrency levels for optimal performance

### Batch Processing Features
```typescript
interface BatchProcessingOptions {
    concurrency?: number;        // Control parallel processing
    onProgress?: (progress: ProcessingProgress) => void;  // Track progress
    abortSignal?: AbortSignal;  // Cancel processing
}

interface ProcessingProgress {
    totalDocuments: number;
    processedDocuments: number;
    totalChunks: number;
    processedChunks: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}
```

### Database Schema
```sql
-- Key tables:
documents (
  id uuid PRIMARY KEY,
  title text,
  content text,
  metadata jsonb,
  user_id uuid REFERENCES users(id),
  team_id uuid REFERENCES teams(id),
  is_private boolean,
  department text,
  created_at timestamp with time zone
)

document_chunks (
  id uuid PRIMARY KEY,
  document_id uuid REFERENCES documents(id),
  content text,
  embedding vector,
  metadata jsonb,
  user_id uuid,
  team_id uuid,
  department text
)

team_members (
  user_id uuid REFERENCES users(id),
  team_id uuid REFERENCES teams(id),
  role text CHECK (role IN ('leader', 'member')),
  PRIMARY KEY (user_id, team_id)
)
```

## Testing
### Test Files
- `src/lib/ai/__tests__/chunking.test.ts`: Document processing tests
- `src/lib/ai/__tests__/document-system.test.ts`: System integration tests
- `src/lib/ai/__tests__/providers.test.ts`: AI provider tests

### Test Coverage
All critical paths are now tested:
- Document chunking and processing
- Embedding generation and storage
- Rate limiting behavior
- Error handling and validation
- Special character preservation
- Team member role enforcement
- Batch processing with progress tracking
- Abort signal handling
- Concurrent processing limits

### Performance Optimizations
- Configurable batch sizes for parallel processing
- Automatic rate limit handling with retries
- Progress tracking for long-running operations
- Efficient chunk overlap calculation
- Optimized database operations
- Memory-efficient document processing

### Common Test Issues
- Rate limit errors are expected in parallel processing tests
- Foreign key constraints must be respected in test data setup
- Team member roles must be either 'leader' or 'member'

## Troubleshooting
### Common Issues
1. Rate Limiting
   - Default: 10 requests per 10 seconds
   - Test mode: 2 requests per 500ms
   - Retry after period is provided in error messages

2. Database Constraints
   - Team member roles must be 'leader' or 'member'
   - Document chunks require valid document_id
   - Users must have valid department assignments

3. Embedding Format
   - PostgreSQL vector type requires specific format
   - Embeddings are stored as string arrays
   - Special characters are preserved in content

### Monitoring
- Console logging implemented for debugging
- Error messages include detailed context
- Rate limit tracking available
- Database constraints enforced

## Security
- Department-based isolation
- Role-based access control
- Private document support
- Secure embedding storage

## API Providers
- Groq
- Deepseek
- Gemini
Rate limiting implemented for all providers

## Dependencies
- Supabase for database and auth
- Next.js for API routes
- Node-fetch for testing
- Jest for testing framework

## Maintenance
### Schema Changes
- Update migrations for new constraints
- Test data setup must match schema
- Foreign key relationships preserved

### Testing
- Run full test suite before deployment
- Verify rate limiting configuration
- Check error handling paths
- Validate team member roles

## Next Steps
✅ Performance optimization for large documents
✅ Batch processing support
- [ ] Enhanced error recovery
- [ ] Additional AI provider integrations
- [ ] Real-time progress visualization
- [ ] Advanced retry strategies
- [ ] Distributed processing support

## Contributing
1. Follow the test-driven development approach
2. Ensure all tests pass before submitting changes
3. Update documentation for new features
4. Maintain consistent error handling 