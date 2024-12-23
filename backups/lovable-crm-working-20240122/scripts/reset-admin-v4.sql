-- 1. First, backup existing tables if not already done
CREATE TABLE IF NOT EXISTS backup_auth_users AS 
SELECT * FROM auth.users;

CREATE TABLE IF NOT EXISTS backup_public_users AS 
SELECT * FROM public.users;

-- 2. Clean up existing user data
DELETE FROM auth.identities WHERE user_id = '0fb30808-5c50-4cd5-b4ec-4ecee7607771';
DELETE FROM public.users WHERE email = 'hugh@bonnymans.co.uk';
DELETE FROM auth.users WHERE email = 'hugh@bonnymans.co.uk';

-- 3. Temporarily disable trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Create admin user using Supabase's auth.users() function
SELECT auth.users() AS created_user FROM auth.create_user(
    '0fb30808-5c50-4cd5-b4ec-4ecee7607771',
    'hugh@bonnymans.co.uk',
    'email',
    '{"name": "Hugh Rogers", "role": "admin"}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    NOW(),
    'Temp123!@#',
    NOW(),
    NOW(),
    NULL,
    NULL,
    'authenticated',
    NOW(),
    NOW()
);

-- 5. Insert into public.users with password hash
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    password_hash,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    raw_user_meta_data->>'name',
    COALESCE(raw_user_meta_data->>'role', 'admin'),
    encrypted_password,
    created_at,
    updated_at
FROM auth.users
WHERE email = 'hugh@bonnymans.co.uk';

-- 6. Recreate the trigger
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

-- 7. Verify the setup
SELECT 
    au.id, 
    au.email as auth_email, 
    au.role as auth_role,
    au.email_confirmed_at,
    pu.email as public_email,
    pu.role as public_role,
    i.provider,
    i.provider_id
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
LEFT JOIN auth.identities i ON i.user_id = au.id
WHERE au.email = 'hugh@bonnymans.co.uk';
