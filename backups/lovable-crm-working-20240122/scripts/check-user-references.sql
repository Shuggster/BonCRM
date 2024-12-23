-- Let's make this simpler and more direct
WITH user_info AS (
    SELECT id, email, role
    FROM auth.users
    WHERE email = 'hugh@bonnymans.co.uk'
)
SELECT 'Current User Info:' as section, 
       u.id, 
       u.email, 
       u.role
FROM user_info u
UNION ALL
SELECT 'Reference Counts:', 
       null::uuid,
       table_name,
       count::text
FROM (
    -- Count references in each table
    SELECT 'auth.users' as table_name, COUNT(*)::text as count
    FROM auth.users
    WHERE email = 'hugh@bonnymans.co.uk'
    UNION ALL
    SELECT 'public.users', COUNT(*)::text
    FROM public.users
    WHERE email = 'hugh@bonnymans.co.uk'
    UNION ALL
    SELECT 'auth.identities', COUNT(*)::text
    FROM auth.identities i
    JOIN user_info u ON u.id = i.user_id
    UNION ALL
    SELECT 'auth.sessions', COUNT(*)::text
    FROM auth.sessions s
    JOIN user_info u ON u.id = s.user_id
    UNION ALL
    SELECT 'auth.mfa_factors', COUNT(*)::text
    FROM auth.mfa_factors m
    JOIN user_info u ON u.id = m.user_id
    UNION ALL
    SELECT 'auth.refresh_tokens', COUNT(*)::text
    FROM auth.refresh_tokens r
    JOIN user_info u ON u.id = r.user_id
) counts;
