-- Verify test contacts were added
SELECT 
    first_name,
    last_name,
    email,
    company,
    tags
FROM contacts;
