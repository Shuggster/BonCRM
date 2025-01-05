-- Check if tables exist
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('documents', 'document_chunks')
ORDER BY table_name, ordinal_position;

-- Check if function exists
SELECT 
    specific_name,
    udt_name as return_type,
    parameter_name,
    parameter_mode,
    ordinal_position,
    data_type,
    udt_name
FROM information_schema.parameters
WHERE specific_schema = 'public'
AND specific_name LIKE 'match_documents%'
ORDER BY ordinal_position;

-- Alternative function check using pg_proc
SELECT 
    proname,
    prorettype::regtype as return_type,
    proargtypes::regtype[] as arg_types,
    proargnames as arg_names
FROM pg_proc
WHERE proname = 'match_documents';

-- Check if vector extension is enabled
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector'; 