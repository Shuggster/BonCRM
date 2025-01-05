-- Verify tables
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'documents'
) as documents_table_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'document_chunks'
) as document_chunks_table_exists;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'document_chunks';

-- Verify function
SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'match_documents'
    AND pronargs = 4
) as match_documents_function_exists;

-- Verify vector extension
SELECT EXISTS (
    SELECT FROM pg_extension
    WHERE extname = 'vector'
) as vector_extension_exists;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('documents', 'document_chunks'); 