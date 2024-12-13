-- Check if contact_tags table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'contact_tags'
) as table_exists;

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contact_tags'
ORDER BY ordinal_position;

-- Check constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'contact_tags'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check RLS policies
SELECT 
    policyname as policy_name,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'contact_tags';
