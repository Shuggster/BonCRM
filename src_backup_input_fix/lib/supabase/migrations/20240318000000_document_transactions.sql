-- Create stored procedures for document processing transactions
CREATE OR REPLACE PROCEDURE begin_document_processing(
    p_title TEXT,
    p_content TEXT,
    p_metadata JSONB,
    p_user_id UUID,
    p_team_id UUID,
    p_is_private BOOLEAN,
    p_department TEXT
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_document_id UUID;
BEGIN
    -- Start transaction
    BEGIN;
    
    -- Create document
    INSERT INTO documents (
        title,
        content,
        metadata,
        user_id,
        team_id,
        is_private,
        department,
        created_at
    ) VALUES (
        p_title,
        p_content,
        p_metadata,
        p_user_id,
        p_team_id,
        p_is_private,
        p_department,
        NOW()
    ) RETURNING id INTO v_document_id;
    
    RETURN v_document_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_document_chunk(
    p_document_id UUID,
    p_content TEXT,
    p_embedding VECTOR,
    p_metadata JSONB,
    p_user_id UUID,
    p_team_id UUID,
    p_department TEXT
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_chunk_id UUID;
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
    ) RETURNING id INTO v_chunk_id;
    
    RETURN v_chunk_id;
END;
$$;

CREATE OR REPLACE PROCEDURE commit_document_processing(
    p_document_id UUID
) LANGUAGE plpgsql AS $$
BEGIN
    -- Commit transaction
    COMMIT;
END;
$$;

CREATE OR REPLACE PROCEDURE rollback_document_processing(
    p_document_id UUID
) LANGUAGE plpgsql AS $$
BEGIN
    -- Rollback transaction
    ROLLBACK;
    
    -- Delete any orphaned chunks (in case some were committed)
    DELETE FROM document_chunks WHERE document_id = p_document_id;
    -- Delete the document
    DELETE FROM documents WHERE id = p_document_id;
END;
$$;

-- Add error tracking table
CREATE TABLE IF NOT EXISTS processing_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    error_type TEXT NOT NULL,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_details TEXT
); 