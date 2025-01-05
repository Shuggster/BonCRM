-- First, check if the table exists and back up any existing data
DO $$
BEGIN
    -- Drop the sequence if it exists
    DROP SEQUENCE IF EXISTS document_testing.documents_id_seq CASCADE;
    
    -- Rename the existing table if it exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
    ) THEN
        ALTER TABLE documents RENAME TO documents_old;
    END IF;
END $$;

-- Create the new table with correct structure
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

-- Create a function to safely convert text to UUID
CREATE OR REPLACE FUNCTION safe_uuid(input text)
RETURNS uuid AS $$
BEGIN
    IF input IS NULL OR input = '' THEN
        RETURN NULL;
    END IF;
    BEGIN
        RETURN input::uuid;
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql;

-- Migrate data if old table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents_old'
    ) THEN
        -- Insert data from old table, converting types as needed
        INSERT INTO documents (
            id,
            title,
            content,
            metadata,
            user_id,
            team_id,
            is_private,
            department,
            file_name,
            file_path,
            created_at,
            updated_at
        )
        SELECT DISTINCT ON (COALESCE(id::text, 'default'))  -- Handle potential duplicate IDs
            COALESCE(safe_uuid(id::text), gen_random_uuid()),
            title,
            content,
            COALESCE(metadata, '{}'::jsonb),
            COALESCE(safe_uuid(user_id::text), (SELECT id FROM users LIMIT 1)), -- Fallback to first user if invalid
            safe_uuid(team_id::text),
            COALESCE(is_private, false),
            department,
            file_name,
            file_path,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM documents_old;

        -- Drop the old table
        DROP TABLE documents_old;
    END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS safe_uuid(text);

-- Recreate the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create a single policy that allows all access to all users
CREATE POLICY "Allow all access to all users"
    ON documents
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify the structure
SELECT 
    c.column_name, 
    c.data_type, 
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN c.column_name IN ('user_id', 'team_id') 
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
            AND tc.table_name = 'documents'
            AND kcu.column_name = c.column_name
            LIMIT 1
        )
        ELSE NULL
    END as references
FROM information_schema.columns c
WHERE c.table_name = 'documents'
AND c.table_schema = 'public'
ORDER BY c.ordinal_position; 

-- Add department column if not exists
ALTER TABLE documents ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS department TEXT;

-- Update or create the match_documents function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    current_user_id uuid,
    user_department text
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity float,
    department text,
    user_id uuid,
    team_id uuid,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.content,
        1 - (dc.embedding <=> query_embedding) as similarity,
        d.department,
        d.user_id,
        d.team_id,
        d.metadata
    FROM documents d
    JOIN document_chunks dc ON d.id = dc.document_id
    WHERE 
        1 - (dc.embedding <=> query_embedding) > match_threshold
        AND d.department = user_department
        AND (
            d.user_id = current_user_id
            OR d.is_private = false
            OR EXISTS (
                SELECT 1 FROM team_members tm
                WHERE tm.team_id = d.team_id
                AND tm.user_id = current_user_id
            )
        )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$; 