-- First, show what we're about to delete
WITH target_user AS (
    SELECT id, email, role
    FROM auth.users
    WHERE email = 'hugh@bonnymans.co.uk'
)
SELECT 'Will delete user:' as message, email, role
FROM target_user;

-- Ask for confirmation (you'll need to remove this comment and the following line to proceed)
-- \echo 'If this looks correct, remove this line and the one above to proceed with deletion'

-- Start a transaction
BEGIN;

DO $$
DECLARE
    v_user_id uuid;
    v_count int;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'hugh@bonnymans.co.uk';

    -- Only proceed if we found exactly one user
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count <> 1 THEN
        RAISE EXCEPTION 'Expected 1 user, found %', v_count;
    END IF;

    -- Delete from auth.refresh_tokens
    DELETE FROM auth.refresh_tokens
    WHERE user_id = v_user_id;

    -- Delete from auth.sessions
    DELETE FROM auth.sessions
    WHERE user_id = v_user_id;

    -- Delete from auth.mfa_factors
    DELETE FROM auth.mfa_factors
    WHERE user_id = v_user_id;

    -- Delete from auth.identities
    DELETE FROM auth.identities
    WHERE user_id = v_user_id;

    -- Delete from public.users
    DELETE FROM public.users
    WHERE id = v_user_id;

    -- Finally delete from auth.users
    DELETE FROM auth.users
    WHERE id = v_user_id;

    -- Verify all deletes were successful
    IF EXISTS (
        SELECT 1 FROM auth.users WHERE id = v_user_id
        UNION ALL
        SELECT 1 FROM public.users WHERE id = v_user_id
        UNION ALL
        SELECT 1 FROM auth.identities WHERE user_id = v_user_id
        UNION ALL
        SELECT 1 FROM auth.sessions WHERE user_id = v_user_id
        UNION ALL
        SELECT 1 FROM auth.refresh_tokens WHERE user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Failed to delete all references to user';
    END IF;
END $$;

-- If we got here, all deletes were successful
COMMIT;

-- Verify deletion
SELECT 'Verification - Records remaining:' as message;
SELECT 'auth.users' as table_name, count(*) as count
FROM auth.users
WHERE email = 'hugh@bonnymans.co.uk'
UNION ALL
SELECT 'public.users', count(*)
FROM public.users
WHERE email = 'hugh@bonnymans.co.uk';
