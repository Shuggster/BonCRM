-- 1. First, backup existing users if not already done
CREATE TABLE IF NOT EXISTS backup_auth_users AS 
SELECT * FROM auth.users;

-- 2. Remove existing user to start fresh
DELETE FROM auth.users WHERE email = 'hugh@bonnymans.co.uk';

-- 3. Create admin user with proper auth setup
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    is_sso_user,
    role,
    instance_id,
    confirmation_token,
    recovery_token,
    aud,
    confirmation_sent_at
)
VALUES (
    '0fb30808-5c50-4cd5-b4ec-4ecee7607771',  -- Keep existing ID
    'hugh@bonnymans.co.uk',
    crypt('Temp123!@#', gen_salt('bf')),      -- Temporary password
    NOW(),
    NOW(),
    NOW(),
    FALSE,
    'admin',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    NULL,
    'authenticated',
    NOW()
);

-- 4. Add to authenticated users
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES (
    '0fb30808-5c50-4cd5-b4ec-4ecee7607771',
    '0fb30808-5c50-4cd5-b4ec-4ecee7607771',
    jsonb_build_object('sub', '0fb30808-5c50-4cd5-b4ec-4ecee7607771', 'email', 'hugh@bonnymans.co.uk'),
    'email',
    NOW(),
    NOW(),
    NOW()
);

-- 5. Verify the user is set up correctly
SELECT 
    u.id, 
    u.email, 
    u.role,
    u.email_confirmed_at,
    i.provider
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'hugh@bonnymans.co.uk';
