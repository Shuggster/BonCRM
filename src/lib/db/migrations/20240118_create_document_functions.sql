-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL,
  team_id UUID,
  department TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create document_chunks table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL,
  team_id UUID,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to insert a document
CREATE OR REPLACE FUNCTION insert_document(
  p_title TEXT,
  p_content TEXT,
  p_metadata JSONB,
  p_user_id UUID,
  p_team_id UUID DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_is_private BOOLEAN DEFAULT false
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to insert a document chunk
CREATE OR REPLACE FUNCTION insert_document_chunk(
  p_document_id UUID,
  p_content TEXT,
  p_embedding vector(768),
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 