-- 1. First, backup existing tables
CREATE TABLE IF NOT EXISTS backup_auth_users AS 
SELECT * FROM auth.users;

CREATE TABLE IF NOT EXISTS backup_public_users AS 
SELECT * FROM public.users;

-- 2. Remove existing user entries
DELETE FROM auth.identities WHERE user_id = '0fb30808-5c50-4cd5-b4ec-4ecee7607771';
DELETE FROM public.users WHERE email = 'hugh@bonnymans.co.uk';
DELETE FROM auth.users WHERE email = 'hugh@bonnymans.co.uk';

-- 3. Temporarily disable trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Create the admin user
DO $$
DECLARE
    temp_password_hash TEXT;
BEGIN
    -- Generate a password hash
    temp_password_hash := crypt('Temp123!@#', gen_salt('bf'));

    -- First insert into public.users
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
        '0fb30808-5c50-4cd5-b4ec-4ecee7607771',
        'hugh@bonnymans.co.uk',
        'Hugh Rogers',
        'admin',
        temp_password_hash,
        NOW(),
        NOW()
    );

    -- Then insert into auth.users
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
        raw_user_meta_data
    )
    VALUES (
        '0fb30808-5c50-4cd5-b4ec-4ecee7607771',
        'hugh@bonnymans.co.uk',
        temp_password_hash,
        NOW(),
        NOW(),
        NOW(),
        FALSE,
        'authenticated',
        '00000000-0000-0000-0000-000000000000',
        jsonb_build_object('name', 'Hugh Rogers', 'role', 'admin')
    );

    -- Set up identity
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
END $$;

-- 5. Recreate the trigger if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (id, email, name, role, password_hash)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
      NEW.encrypted_password
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verify the setup
SELECT 
    au.id, 
    au.email as auth_email, 
    au.role as auth_role,
    au.email_confirmed_at,
    pu.email as public_email,
    pu.role as public_role,
    i.provider
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
LEFT JOIN auth.identities i ON i.user_id = au.id
WHERE au.email = 'hugh@bonnymans.co.uk';
