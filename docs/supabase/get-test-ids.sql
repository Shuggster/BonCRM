-- Get a valid user ID
SELECT id as user_id, email 
FROM users 
LIMIT 1;

-- Get a valid team ID
SELECT id as team_id, name 
FROM teams 
LIMIT 1; 