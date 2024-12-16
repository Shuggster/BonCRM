-- Get all columns from contacts table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;