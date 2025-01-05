# ShugBot Cloud Integration Documentation

## Database Schema

### Documents Table
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL,
    team_id UUID,
    is_private BOOLEAN DEFAULT false,
    department TEXT,
    file_name TEXT,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);
```

### Document Chunks Table (Vector Store)
```sql
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID NOT NULL,
    team_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);
```

## Security

### Row Level Security (RLS)
Both tables have RLS enabled with open access policies:

#### Documents Table
```sql
CREATE POLICY "Allow all access to all users"
    ON documents
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

#### Document Chunks Table
```sql
CREATE POLICY "Allow all access to all users"
    ON document_chunks
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

Note: While RLS is enabled, the current policies allow all users to perform all operations on both tables.

## AI Integration

### Providers
- Primary: Deepseek
- Secondary: Gemini (Google AI)
- Tertiary: Groq

### Environment Variables
Required API keys:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### Vector Search
The system uses Supabase's vector extension for similarity search with the following features:
- Embedding size: 1536 dimensions
- Index type: IVFFlat with cosine similarity
- Match function with configurable threshold and count

```sql
-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    current_user_id uuid
)
RETURNS TABLE (
    id uuid,
    document_id uuid,
    content text,
    metadata jsonb,
    similarity float
);
```

## Dependencies
```json
{
  "@google/generative-ai": "latest",
  "ai": "latest"
}
```

## Testing
Test files are available for:
- Provider functionality (`src/lib/ai/test-providers.ts`)
- Document processing (`src/lib/ai/test-document-processor.ts`)
- Vector search (`src/lib/ai/test-vector-search.ts`)

## Maintenance Notes
1. All schema changes should be documented in `docs/supabase/`
2. New AI providers should implement the common interface
3. Vector store operations have open access (no RLS restrictions)
4. Environment variables should be kept up to date in both development and production

## Current Status
- [x] Documents table schema finalized
- [x] Document chunks table schema finalized
- [x] RLS enabled with open access
- [x] Vector search function created
- [x] AI providers integrated
- [ ] Document processing pipeline completed
- [ ] Full test coverage achieved 