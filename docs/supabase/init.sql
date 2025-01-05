-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS document_chunks;
DROP TABLE IF EXISTS documents;

-- Create the documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id TEXT NOT NULL,
    team_id TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Create the document chunks table
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id TEXT NOT NULL,
    team_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create an index for faster similarity search
CREATE INDEX ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create the similarity search function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    current_user_id TEXT
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (
        dc.user_id = current_user_id
        OR (
            dc.team_id IN (
                SELECT team_id 
                FROM documents 
                WHERE user_id = current_user_id 
                AND team_id IS NOT NULL
            )
            AND NOT d.is_private
        )
    )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    TO authenticated
    USING (
        user_id = current_user
        OR (
            team_id IN (
                SELECT team_id 
                FROM documents 
                WHERE user_id = current_user 
                AND team_id IS NOT NULL
            )
            AND NOT is_private
        )
    );

CREATE POLICY "Users can insert their own documents"
    ON documents FOR INSERT
    TO authenticated
    WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    TO authenticated
    USING (user_id = current_user)
    WITH CHECK (user_id = current_user);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    TO authenticated
    USING (user_id = current_user);

-- Create policies for document chunks
CREATE POLICY "Users can view their own document chunks"
    ON document_chunks FOR SELECT
    TO authenticated
    USING (
        user_id = current_user
        OR (
            team_id IN (
                SELECT team_id 
                FROM documents 
                WHERE user_id = current_user 
                AND team_id IS NOT NULL
            )
            AND NOT EXISTS (
                SELECT 1 
                FROM documents d 
                WHERE d.id = document_id 
                AND d.is_private
            )
        )
    );

CREATE POLICY "Users can insert their own document chunks"
    ON document_chunks FOR INSERT
    TO authenticated
    WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update their own document chunks"
    ON document_chunks FOR UPDATE
    TO authenticated
    USING (user_id = current_user)
    WITH CHECK (user_id = current_user);

CREATE POLICY "Users can delete their own document chunks"
    ON document_chunks FOR DELETE
    TO authenticated
    USING (user_id = current_user); 