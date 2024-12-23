-- Check contacts table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable,
    generation_expression
FROM information_schema.columns 
WHERE table_name = 'contacts' 
ORDER BY ordinal_position;

-- Specifically check for name column
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contacts' 
    AND column_name = 'name'
) as name_column_exists;
