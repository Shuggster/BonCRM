# User Creation and Authentication Process

This document outlines the process for creating new users in the system and managing user authentication.

## Overview

Creating a user requires inserting records into the `public.users` table and handling authentication via NextAuth.js.

## Authentication Architecture

### Primary Components
1. **NextAuth.js**: Primary authentication provider
   - Handles user sessions and JWT tokens
   - Uses credentials provider with email/password
   - Session data includes: id, email, name, role

2. **Supabase Database**: User data storage
   - `users` table stores user profiles and credentials
   - Uses bcrypt for password hashing
   - Direct database access (not Supabase Auth)

### Important Implementation Details

1. **User Authentication**
   - Users are authenticated via NextAuth.js
   - Passwords are hashed using bcrypt
   - Session is maintained via JWT strategy
   - Session maxAge: 30 days

2. **Password Management**
   - Passwords are stored as hashes in `users.password_hash`
   - Password changes are handled via server actions
   - Direct database updates using service role key
   - No dependency on Supabase Auth

3. **Security Considerations**
   - Service role key used only on server side
   - Client operations use anon key
   - Password updates require authenticated session
   - All sensitive operations use server actions

## Steps to Create a User

1. Copy the template from `scripts/create_user_template.sql`
2. Replace the following placeholders:
   - `NEW_USER_EMAIL`: User's email address
   - `USER_FULL_NAME`: User's full name
   - `USER_ROLE`: Either 'admin' or 'user'
   - `TEMP_PASSWORD`: Temporary password for the user

Example:
```sql
-- Original
v_password_hash text := crypt('TEMP_PASSWORD', gen_salt('bf'));
-- Replace with
v_password_hash text := crypt('MyTemp123!', gen_salt('bf'));
```

## Implementation Guide

### User Creation
```sql
-- Users table structure
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user'
);
```

### Password Change Process
```typescript
// Server action for password changes
export async function changePassword(newPassword: string) {
  // 1. Verify session
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Not authenticated')

  // 2. Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // 3. Update database
  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashedPassword })
    .eq('email', session.user.email)

  if (error) throw new Error('Failed to update password')
}
```

### Client-Side Components
- Use 'use client' directive
- Implement proper mounting checks
- Handle hydration mismatches:
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) {
  return <PlaceholderComponent /> // Match server structure
}
```

## Important Notes

1. **Password Security**
   - Always use a strong temporary password
   - Require users to change password on first login
   - Never reuse temporary passwords

2. **User Roles**
   - `admin`: Full system access
   - `user`: Standard user access

3. **Email Confirmation**
   - Users are created with emails pre-confirmed
   - No email verification step needed

4. **Database Tables**
   - `public.users`: Profile information
   - `auth.users`: Authentication data
   - `auth.identities`: Provider linkage

## Common Issues and Solutions

1. **Hydration Errors**
   - Cause: Server/client HTML mismatch
   - Solution: Use mounting checks and placeholders
   - Always match server-rendered structure

2. **Authentication Errors**
   - Cause: Missing or invalid session
   - Solution: Verify session before operations
   - Use server actions for sensitive operations

3. **Password Updates**
   - Cause: Direct Supabase Auth usage
   - Solution: Use custom users table
   - Update password_hash directly

## Best Practices

1. **Security**
   - Never use service role key on client
   - Always hash passwords server-side
   - Validate sessions before operations
   - Use server actions for data mutations

2. **Component Design**
   - Handle client/server state differences
   - Provide loading states
   - Match server/client HTML structure
   - Use proper error boundaries

3. **Error Handling**
   - Provide clear error messages
   - Log errors server-side
   - Handle common failure cases
   - Show user-friendly notifications

## Testing

1. **Authentication Flow**
   - Test login with valid credentials
   - Verify session persistence
   - Check protected route access
   - Validate password changes

2. **Error Cases**
   - Invalid credentials
   - Session expiration
   - Network failures
   - Invalid password formats

## Troubleshooting

If you encounter errors:
1. Check that email is unique
2. Ensure password meets complexity requirements
3. Verify all placeholders were replaced
4. Check that the transaction completed (COMMIT successful)

## Next Steps

After creating a user:
1. Communicate credentials securely to the user
2. Require password change on first login
3. Assign any additional role-specific permissions
