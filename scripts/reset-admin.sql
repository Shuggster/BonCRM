-- 1. First, backup existing users
CREATE TABLE IF NOT EXISTS backup_auth_users AS 
SELECT * FROM auth.users;

-- 2. Create admin user if doesn't exist (this is safe, will error if exists)
INSERT INTO auth.users (
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    is_sso_user,
    role
)
SELECT 
    'hugh@bonnymans.co.uk',
    NOW(),
    NOW(),
    NOW(),
    FALSE,
    'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'hugh@bonnymans.co.uk'
);

-- 3. Get the admin user's ID
SELECT id, email FROM auth.users WHERE email = 'hugh@bonnymans.co.uk';
