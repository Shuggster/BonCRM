-- Check existing triggers
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation,
    action_statement as trigger_code
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';
