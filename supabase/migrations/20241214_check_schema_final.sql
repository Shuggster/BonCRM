-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('contacts', 'contact_activities', 'contact_notes', 'contact_tags', 'contact_tag_relations', 'scheduled_activities')
ORDER BY table_name;

-- Check contacts table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'contact_activities', 'contact_notes', 'contact_tags', 'contact_tag_relations', 'scheduled_activities');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('contacts', 'contact_activities', 'contact_notes', 'contact_tags', 'contact_tag_relations', 'scheduled_activities');
