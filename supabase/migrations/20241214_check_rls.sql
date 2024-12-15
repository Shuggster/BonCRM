-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    hasrls as has_rls, 
    rowsecurity as row_security
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'contacts';

-- Check existing policies
SELECT * 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'contacts';
