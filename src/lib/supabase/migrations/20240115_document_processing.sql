-- Enable pgvector extension if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    department TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_chunks table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for text search
CREATE INDEX IF NOT EXISTS documents_title_idx ON documents USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS documents_content_idx ON documents USING GIN (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS document_chunks_content_idx ON document_chunks USING GIN (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Function to insert document
CREATE OR REPLACE FUNCTION insert_document(
    p_title TEXT,
    p_content TEXT,
    p_metadata JSONB,
    p_user_id UUID,
    p_team_id UUID,
    p_is_private BOOLEAN,
    p_department TEXT
) RETURNS documents AS $$
DECLARE
    v_document documents;
BEGIN
    -- Insert document
    INSERT INTO documents (
        title,
        content,
        metadata,
        user_id,
        team_id,
        department,
        is_private
    ) VALUES (
        p_title,
        p_content,
        p_metadata,
        p_user_id,
        p_team_id,
        p_department,
        p_is_private
    )
    RETURNING * INTO v_document;
    
    RETURN v_document;
END;
$$ LANGUAGE plpgsql;

-- Function to add document chunk
CREATE OR REPLACE FUNCTION insert_document_chunk(
    p_document_id UUID,
    p_content TEXT,
    p_embedding VECTOR(1536),
    p_metadata JSONB,
    p_user_id UUID,
    p_team_id UUID,
    p_department TEXT
) RETURNS document_chunks AS $$
DECLARE
    v_chunk document_chunks;
BEGIN
    -- Insert chunk
    INSERT INTO document_chunks (
        document_id,
        content,
        embedding,
        metadata,
        user_id,
        team_id,
        department
    ) VALUES (
        p_document_id,
        p_content,
        p_embedding,
        p_metadata,
        p_user_id,
        p_team_id,
        p_department
    )
    RETURNING * INTO v_chunk;
    
    RETURN v_chunk;
END;
$$ LANGUAGE plpgsql; 