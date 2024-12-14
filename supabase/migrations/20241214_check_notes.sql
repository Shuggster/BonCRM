-- Check if notes are being inserted
SELECT * FROM contact_notes;

-- Check if there are any errors in recent operations
SELECT * FROM contact_notes ORDER BY created_at DESC LIMIT 5;

-- Verify the RLS policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'contact_notes';
