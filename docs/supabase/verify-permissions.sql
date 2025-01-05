-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('documents', 'document_chunks');

-- Verify user permissions (fixed type casting)
SELECT 
    r.rolname, 
    ARRAY_AGG(p.polname::text) as policies,
    ARRAY_AGG(p.polcmd::text) as commands
FROM pg_roles r
LEFT JOIN pg_policy p ON r.rolname::text = ANY(p.polroles::text[])
WHERE r.rolname = 'authenticated'
GROUP BY r.rolname;

-- Verify function permissions
SELECT 
    p.proname,
    r.rolname,
    has_function_privilege(r.oid, p.oid, 'execute') as has_execute
FROM pg_proc p
CROSS JOIN pg_roles r
WHERE p.proname = 'match_documents'
AND r.rolname = 'authenticated';

-- Fix permissions if needed
DO $$
BEGIN
    -- Ensure authenticated role has necessary permissions
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
    ) THEN
        CREATE ROLE authenticated;
    END IF;

    -- Grant usage on schema
    GRANT USAGE ON SCHEMA public TO authenticated;

    -- Grant access to tables
    GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON document_chunks TO authenticated;

    -- Grant execute on function
    GRANT EXECUTE ON FUNCTION match_documents(VECTOR(1536), FLOAT, INT, TEXT) TO authenticated;
END
$$; 