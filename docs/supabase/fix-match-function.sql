-- Drop existing function(s) with conflicting signatures
DROP FUNCTION IF EXISTS public.match_documents(public.vector, double precision, integer, text);
DROP FUNCTION IF EXISTS public.match_documents(public.vector, double precision, integer, uuid);

-- Recreate the function with standardized signature
CREATE OR REPLACE FUNCTION public.match_documents(
    query_embedding vector,
    match_threshold double precision DEFAULT 0.8,
    match_count integer DEFAULT 5,
    current_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity double precision,
    metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity,
        dc.metadata
    FROM
        document_chunks dc
    WHERE
        1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY
        dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.match_documents(vector, double precision, integer, uuid) TO authenticated;

-- Verify the function exists with correct parameters
SELECT 
    proname,
    proargnames,
    proargtypes,
    prosecdef
FROM pg_proc 
WHERE proname = 'match_documents'; 