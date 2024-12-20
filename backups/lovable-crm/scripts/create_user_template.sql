-- Template for creating new users in the system
-- Replace the following variables:
-- - NEW_USER_EMAIL: The user's email address
-- - USER_FULL_NAME: The user's full name
-- - USER_ROLE: Either 'admin' or 'user'
-- - TEMP_PASSWORD: Temporary password for the user

-- Start transaction for safety
BEGIN;

-- Temporarily disable the trigger to prevent duplicate inserts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Generate values we'll need
DO $$
DECLARE
    v_user_id uuid := gen_random_uuid();
    v_password_hash text := crypt('TEMP_PASSWORD', gen_salt('bf'));
BEGIN
    -- 1. Create public.users record first
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        password_hash,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        'NEW_USER_EMAIL',
        'USER_FULL_NAME',
        'USER_ROLE',
        v_password_hash,
        now(),
        now()
    );

    -- 2. Create auth.users record
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        raw_user_meta_data,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        'NEW_USER_EMAIL',
        v_password_hash,
        now(),  -- Email pre-confirmed
        'authenticated',
        jsonb_build_object(
            'name', 'USER_FULL_NAME',
            'role', 'USER_ROLE'
        ),
        now(),
        now()
    );

    -- 3. Create identity record
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        v_user_id,
        'NEW_USER_EMAIL',  -- Using email as provider_id
        'email',
        jsonb_build_object(
            'sub', v_user_id,
            'email', 'NEW_USER_EMAIL'
        ),
        now(),
        now()
    );

END $$;

-- Recreate the trigger for future use
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, password_hash)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.encrypted_password
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Verify the new user was created properly
SELECT 
    au.id,
    au.email,
    au.role as auth_role,
    pu.role as public_role,
    i.provider,
    i.provider_id
FROM auth.users au
JOIN public.users pu ON pu.id = au.id
LEFT JOIN auth.identities i ON i.user_id = au.id
WHERE au.email = 'NEW_USER_EMAIL';

COMMIT;
