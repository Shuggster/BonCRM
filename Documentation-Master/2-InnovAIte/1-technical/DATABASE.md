# Database Guide

## Overview

InnovAIte uses Supabase as its database and authentication provider. Here's what you need to know:

## Tables

### 1. User Management
```sql
-- Managed by Supabase Auth
auth.users
  - id (uuid, primary key)
  - email
  - encrypted_password
  - email_confirmed_at
  - ...

-- Our custom profile table
public.profiles
  - id (uuid, references auth.users)
  - full_name
  - avatar_url
  - role
  - deleted_at (for soft deletes)
  - created_at
  - updated_at
```

## Common Operations

### 1. Fetching User Data
```javascript
// DON'T do this ❌
const { data } = await supabase
  .from('profiles')
  .select('*');

// DO this ✅
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .is('deleted_at', null);

if (error) {
  toast.error('Failed to fetch users');
  return;
}
```

### 2. Updating Profiles
```javascript
// DON'T do this ❌
await supabase
  .from('profiles')
  .update({ full_name: 'New Name' })
  .eq('id', userId);

// DO this ✅
const { error } = await supabase
  .from('profiles')
  .update({ 
    full_name: 'New Name',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);

if (error) {
  toast.error('Failed to update profile');
  return;
}
```

### 3. Soft Deletes
```javascript
// DON'T do this ❌
await supabase
  .from('profiles')
  .delete()
  .eq('id', userId);

// DO this ✅
const { error } = await supabase
  .from('profiles')
  .update({ 
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

## Important Notes

### 1. Always Handle Errors
```javascript
try {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  // Handle data
} catch (error) {
  toast.error(error.message);
  console.error('Database error:', error);
}
```

### 2. Use TypeScript Types
```typescript
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  deleted_at: string | null;
}
```

### 3. Follow Security Best Practices
- Never expose sensitive data
- Always use RLS policies
- Handle soft deletes consistently
- Use prepared statements (handled by Supabase client)

## Common Gotchas

1. **Deleted Records**
   - Always include `.is('deleted_at', null)` in queries
   - Use soft deletes instead of hard deletes

2. **Auth vs Profiles**
   - Don't modify `auth.users` directly
   - Use `public.profiles` for user data
   - Keep auth and profile data in sync

3. **Error Handling**
   - Always check for errors
   - Use toast notifications
   - Log errors for debugging

## Database Migrations

Located in `supabase/migrations/`:
- `20250118_add_soft_delete.sql`
- `20250118_user_restore.sql`
- `20250118_check_rate_limits.sql`
- etc.

### Running Migrations
```bash
# Local development
npm run db:migrate

# Production
# Migrations run automatically on deploy
```

## Need Help?

1. Check Supabase documentation
2. Review existing migrations
3. Test queries in Supabase dashboard
4. Follow established patterns in codebase
