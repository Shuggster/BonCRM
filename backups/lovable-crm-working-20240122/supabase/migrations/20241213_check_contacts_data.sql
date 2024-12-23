-- Check if we have any contacts
SELECT COUNT(*) as total_contacts FROM contacts;

-- Look at actual contact data
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    name,
    email
FROM contacts
LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'contacts';
