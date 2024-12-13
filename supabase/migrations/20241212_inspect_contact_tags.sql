-- Check if contact_tags table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'contact_tags'
) as table_exists;

-- If it exists, get table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_tags';

-- Get sample of data (first 10 rows)
SELECT *
FROM contact_tags
LIMIT 10;
