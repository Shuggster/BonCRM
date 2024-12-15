# Authentication System Implementation Guide

## Core Requirements
1. Use NextAuth with custom Credentials Provider
2. Manual password management with bcrypt
3. Maintain Supabase table structure compatibility
4. No Supabase Auth - only database operations

## Previous Session Errors and Mistakes to Avoid
1. **DO NOT** make unauthorized changes to:
   - Admin page routing
   - User management page
   - Sidebar navigation
   - Page styling and animations
2. **DO NOT** modify existing working code without explicit approval
3. **DO NOT** remove or alter existing directory structures
4. **DO NOT** add experimental styling or animations without approval
5. **ALWAYS** wait for explicit approval before making any changes

## Current Auth System Setup
1. **NextAuth.js (Primary Auth System)**
   - Handles all authentication flows
   - Manages sessions and tokens
   - Protects routes via middleware
   - Located in `/api/auth/[...nextauth]`

2. **Supabase (Database & User Management)**
   - Stores user data and credentials
   - Handles password verification
   - Manages user roles and permissions
   - NOT used for its built-in auth features

## Important: Do Not Mix Auth Systems
- DO NOT implement Supabase Auth
- DO NOT modify existing NextAuth setup
- Keep using NextAuth for all auth flows
- Use Supabase only for database operations

## Database Schema
```sql
-- Users Table (Compatible with auth.users structure)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('admin', 'senior_management', 'department_manager', 'operational')) NOT NULL DEFAULT 'operational',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial Admin User
INSERT INTO users (id, email, name, role) VALUES 
('0fb30808-5c50-4cd5-b4ec-4ecee7607771', 'admin@example.com', 'Admin User', 'admin');
```

## Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Required Dependencies
```json
{
  "dependencies": {
    "next-auth": "latest",
    "bcrypt": "^5.1.1",
    "@supabase/supabase-js": "latest"
  }
}
```

## File Structure
```
/src
  /app
    /(auth)           # Isolated auth routes
      /login
        page.tsx      # Login page with NextAuth credentials form
        layout.tsx    # Auth-specific layout (no nav bar)
    /(authenticated)  # Protected routes
      /dashboard
        page.tsx
      /admin
        /users
          page.tsx
  /lib
    /auth
      bcrypt.ts      # Password hashing utilities
      options.ts     # NextAuth configuration
      session.ts     # Session management
    supabase.ts      # Supabase client (database only)
```

## Implementation Steps

1. **Password Management Setup**
   ```typescript
   // lib/auth/bcrypt.ts
   import bcrypt from 'bcrypt';

   export const hashPassword = async (password: string) => {
     const saltRounds = 10;
     return await bcrypt.hash(password, saltRounds);
   };

   export const verifyPassword = async (password: string, hashedPassword: string) => {
     return await bcrypt.compare(password, hashedPassword);
   };
   ```

2. **NextAuth Configuration**
   ```typescript
   // lib/auth/options.ts
   import CredentialsProvider from "next-auth/providers/credentials";
   import { verifyPassword } from "./bcrypt";
   import { supabase } from "../supabase";

   export const authOptions = {
     providers: [
       CredentialsProvider({
         async authorize(credentials) {
           const { email, password } = credentials;
           
           // Fetch user from database
           const { data: user, error } = await supabase
             .from("users")
             .select("*")
             .eq("email", email)
             .single();

           if (!user || error) throw new Error("No user found");
           
           // Verify password
           const isValid = await verifyPassword(password, user.password_hash);
           if (!isValid) throw new Error("Invalid credentials");

           return {
             id: user.id,
             email: user.email,
             name: user.name,
             role: user.role
           };
         }
       })
     ],
     pages: {
       signIn: "/login"
     },
     callbacks: {
       async session({ session, token }) {
         if (token) {
           session.user.id = token.id;
           session.user.role = token.role;
         }
         return session;
       }
     }
   };
   ```

## Security Notes
1. Never store plain text passwords
2. Always use bcrypt for password hashing
3. Maintain session security through NextAuth
4. Keep auth routes isolated from main app
5. Protect all authenticated routes

## Current Project Status
- ✅ Database tables and schemas are already created and working
- ✅ Supabase policies are in place
- ✅ Environment variables are configured
- 🔄 Remaining task: Create and implement authentication pages only

## Implementation Steps (Updated)
1. **Auth Route Setup**
   - Create `src/app/(auth)` route group for isolated auth pages
   - Create `src/app/(auth)/layout.tsx` - minimal layout without nav bar
   - Create `src/app/(auth)/login/page.tsx` - login form
   - Ensure no shared components with main app layout

2. **Auth Flow**
   - Login form submits credentials
   - On success, redirect to `/dashboard`
   - Dashboard and other protected routes use main layout with nav bar

3. **Route Protection**
   - All routes under `/(authenticated)` require auth
   - Login page under `/(auth)` is public
   - Redirect unauthorized access to login

4. **Auth Components Needed**
   - Login form
   - Session management
   - Role-based access control components

5. **Integration Points**
   - Connect existing admin pages with auth system
   - Implement protected routes
   - Add role-based access checks

6. **Testing Required**
   - Authentication flow
   - Role-based access
   - Admin functionality
   - Session management

DO NOT:
- Modify existing database tables
- Change Supabase policies
- Alter environment configurations

## Verified Implementation Plan - December 2024

## Phase 1: Setup and Verification
- [ ] 1.1. Verify current state
  - [ ] Confirm all core files are untouched
  - [ ] Verify Supabase tables and policies
  - [ ] Check environment variables
  - [ ] Document current working state

- [ ] 1.2. Create isolated auth directory
  - [ ] Create `/src/auth-system` directory
  - [ ] Verify it doesn't conflict with existing paths
  - [ ] Document directory structure

## Phase 2: Auth Components (Isolated)
- [ ] 2.1. Create basic auth page structure
  - [ ] Create standalone login page
  - [ ] NO modifications to main layout
  - [ ] NO shared components with main app
  - [ ] Verify isolation

- [ ] 2.2. Implement auth logic
  - [ ] Create isolated Supabase auth client
  - [ ] Implement basic login function
  - [ ] Test in isolation
  - [ ] Verify no core file changes

## Phase 3: Authentication Flow
- [ ] 3.1. Setup auth routing
  - [ ] Create isolated auth routes
  - [ ] Verify no conflict with main routes
  - [ ] Test route isolation

- [ ] 3.2. Implement login flow
  - [ ] Basic email/password form
  - [ ] Supabase authentication
  - [ ] Success/failure handling
  - [ ] Verify no core dependencies

## Phase 4: Integration Points
- [ ] 4.1. Create auth state handler
  - [ ] Implement minimal session storage
  - [ ] Create auth status check
  - [ ] Test in isolation

- [ ] 4.2. Setup redirect flow
  - [ ] Successful auth → dashboard
  - [ ] Maintain admin privileges
  - [ ] Verify no core modifications

## Phase 5: Testing and Verification
- [ ] 5.1. Test authentication
  - [ ] Test login success
  - [ ] Test login failure
  - [ ] Verify session handling
  - [ ] Check admin privileges

- [ ] 5.2. Final verification
  - [ ] Verify core files unchanged
  - [ ] Test main app functionality
  - [ ] Document working state

## Checkpoint Rules
1. STOP and verify after each phase
2. Document any issues before proceeding
3. NO core file modifications at any point
4. Each component must be tested in isolation
5. Get explicit approval before moving between phases

## Rollback Plan
If any step fails:
1. Document the exact point of failure
2. Do not proceed to next step
3. Do not modify any additional files
4. Await explicit instruction before continuing

## Success Criteria
- Auth system completely separate
- No modifications to core files
- Clean authentication flow
- Proper admin privilege handling
- All existing functionality preserved

## File Structure to Preserve
```
/src
  /app
    /(auth)           # Isolated auth routes with separate layout
      /login
        page.tsx      # Login page
        layout.tsx    # Auth-specific layout (no nav bar)
    /(authenticated)  # Protected routes with main layout
      /dashboard
        page.tsx
      /admin
        /users
          page.tsx    # User management page
        /settings
          page.tsx    # Settings page
        /roles
          page.tsx    # Roles page
  /components
    /layout
      sidebar.tsx     # Main navigation (only for authenticated routes)
      page-header.tsx # Page headers
  /lib
    supabase.ts      # Supabase client
    auth.ts          # Auth utilities
```

## Known Working Features to Preserve
1. Admin page routing under /(app)/admin/
2. Existing user management functionality
3. Current sidebar navigation
4. Dashboard styling and animations

## Security Requirements
1. Password hashing (handled by bcrypt)
2. Session management
3. CSRF protection
4. Role-based access control

## Error Recovery Steps
If issues occur:
1. Stop all changes immediately
2. Document the error
3. Request explicit approval before fixes
4. Test in isolation before integration

## Notes for Next Session
1. Always verify file structure before changes
2. Request approval for each modification
3. Test authentication flow in isolation
4. Preserve existing styling and animations
5. Document all changes made

Remember: This is a working project with custom styling and animations. Any changes must preserve existing functionality while adding authentication features.


# Auth Implementation Checklist

## 1. Auth Layout Setup
- [ ] Create separate auth layout that bypasses main layout
- [ ] No Sidebar, no main site components
- [ ] Simple, clean authentication-only styling

## 2. Authentication Flow
- [ ] Create NextAuth configuration
  - [ ] Use Supabase only for database queries
  - [ ] Handle admin role verification
  - [ ] Set up proper session management

## 3. Login Page Implementation
- [ ] Create standalone login page
  - [ ] No inheritance from main layout
  - [ ] Custom styling separate from main site
  - [ ] Basic form with email/password
  - [ ] Error handling and loading states

## 4. Route Protection
- [ ] Set up middleware for auth routes
- [ ] Protect admin routes without modifying existing ones
- [ ] Handle role-based access

## 5. Testing Checkpoints
- [ ] Test login form in isolation
- [ ] Verify no main site components appear
- [ ] Test admin role restrictions
- [ ] Verify redirect to dashboard after login

## Critical Rules
1. NO modifications to:
   - src/app/layout.tsx
   - src/components/layout/Sidebar.tsx
   - Any existing core files

2. Keep Separate:
   - Auth pages from main site
   - Auth styling from main styling
   - Auth routes from main routes

3. Use Existing:
   - Database structure
   - Environment variables
   - Supabase connection