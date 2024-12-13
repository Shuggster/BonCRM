-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('contacts', 'contact_tags', 'tags', 'contact_tag_relations', 'industries');

-- Check contact_tags structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_tags';
