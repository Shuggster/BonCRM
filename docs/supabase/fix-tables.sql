-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- First, check if the table exists and back up any existing data
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'document_chunks'
    ) THEN
        -- Backup existing data
        CREATE TEMP TABLE document_chunks_backup AS
        SELECT * FROM document_chunks;
    END IF;
END $$;

-- Drop and recreate document_chunks table
DROP TABLE IF EXISTS document_chunks;

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

-- Create index for vector similarity search
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create the match_documents function
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create a single policy that allows all access to all users
CREATE POLICY "Allow all access to all users"
    ON document_chunks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Restore data if backup exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'pg_temp' 
        AND tablename = 'document_chunks_backup'
    ) THEN
        INSERT INTO document_chunks (
            id,
            document_id,
            content,
            embedding,
            metadata,
            user_id,
            team_id,
            created_at
        )
        SELECT 
            COALESCE(b.id, gen_random_uuid()),
            b.document_id,
            b.content,
            b.embedding::vector(1536),
            COALESCE(b.metadata, '{}'::jsonb),
            b.user_id,
            b.team_id,
            COALESCE(b.created_at, NOW())
        FROM document_chunks_backup b;

        -- Drop backup table
        DROP TABLE document_chunks_backup;
    END IF;
END $$;

-- Verify the structure
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN c.column_name IN ('user_id', 'team_id', 'document_id') 
        THEN (
            SELECT 
                ccu.table_name || '.' || ccu.column_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'document_chunks'
            AND kcu.column_name = c.column_name
            LIMIT 1
        )
        ELSE NULL
    END as references
FROM information_schema.columns c
WHERE c.table_name = 'document_chunks'
AND c.table_schema = 'public'
ORDER BY c.ordinal_position;