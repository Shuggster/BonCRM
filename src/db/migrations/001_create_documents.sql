-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgvector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID,
  department TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);

-- Create function to insert a document
CREATE OR REPLACE FUNCTION insert_document(
  p_title TEXT,
  p_content TEXT,
  p_metadata JSONB,
  p_user_id UUID,
  p_team_id UUID DEFAULT NULL,
  p_is_private BOOLEAN DEFAULT false,
  p_department TEXT DEFAULT NULL
) RETURNS documents AS $$
DECLARE
  v_document documents;
BEGIN
  INSERT INTO documents (
    title,
    content,
    metadata,
    user_id,
    team_id,
    is_private,
    department
  )
  VALUES (
    p_title,
    p_content,
    p_metadata,
    p_user_id,
    p_team_id,
    p_is_private,
    p_department
  )
  RETURNING * INTO v_document;

  RETURN v_document;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to insert a document chunk
CREATE OR REPLACE FUNCTION insert_document_chunk(
  p_document_id UUID,
  p_content TEXT,
  p_embedding VECTOR(1536),
  p_metadata JSONB,
  p_user_id UUID,
  p_team_id UUID DEFAULT NULL,
  p_department TEXT DEFAULT NULL
) RETURNS document_chunks AS $$
DECLARE
  v_chunk document_chunks;
BEGIN
  INSERT INTO document_chunks (
    document_id,
    content,
    embedding,
    metadata,
    user_id,
    team_id,
    department
  )
  VALUES (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to match documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  current_user_id UUID,
  user_department TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  document_id UUID,
  document_title TEXT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    d.id as document_id,
    d.title as document_title,
    dc.metadata
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  AND (
    -- Document is public and either:
    -- 1. No department restriction
    -- 2. Document is in user's department
    (NOT d.is_private AND (
      user_department IS NULL OR
      d.department = user_department
    ))
    OR
    -- Document is private but user has access
    (d.is_private AND (
      d.user_id = current_user_id OR
      d.team_id IN (
        SELECT team_id FROM users WHERE id = current_user_id
      )
    ))
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 