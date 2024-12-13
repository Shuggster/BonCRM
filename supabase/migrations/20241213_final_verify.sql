-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_tags' 
ORDER BY ordinal_position;
