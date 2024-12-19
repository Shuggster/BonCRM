# User Management Implementation Plan

## Phase 0: Database Setup
1. **Create Users Table**
   ```sql
   -- Run in Supabase SQL editor
   CREATE TABLE public.users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'operational')),
     department TEXT NOT NULL CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop')),
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- For job sharing
   CREATE TABLE public.job_share_pairs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user1_id UUID REFERENCES users(id),
     user2_id UUID REFERENCES users(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user1_id, user2_id)
   );
   ```

## Phase 1: Authentication Setup
1. **NextAuth Configuration**
   ```typescript
   // src/lib/auth/options.ts
   export const authOptions: NextAuthOptions = {
     providers: [
       CredentialsProvider({
         async authorize(credentials) {
           const { email, password } = credentials;
           const { data: user } = await supabase
             .from('users')
             .select('*')
             .eq('email', email)
             .single();

           if (!user) throw new Error('No user found');
           
           const isValid = await verifyPassword(password, user.password_hash);
           if (!isValid) throw new Error('Invalid credentials');

           return {
             id: user.id,
             email: user.email,
             name: user.name,
             role: user.role
           };
         }
       })
     ],
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

2. **Password Management**
   ```typescript
   // src/app/actions/auth.ts
   export async function changePassword(newPassword: string) {
     const session = await getServerSession(authOptions);
     if (!session?.user?.email) throw new Error('Not authenticated');

     const hashedPassword = await hashPassword(newPassword);
     const { error } = await supabase
       .from('users')
       .update({ password_hash: hashedPassword })
       .eq('email', session.user.email);

     if (error) throw new Error('Failed to update password');
     return { success: true };
   }
   ```

## Phase 2: User Management Components

1. **Create User Form**
   ```typescript
   // Components needed:
   - CreateUserForm (client component)
   - UserList (server component)
   - UserActions (client component)
   ```

2. **Settings Pages**
   ```typescript
   // Pages needed:
   /settings/profile   - User profile settings
   /settings/security  - Password management
   /settings/users     - User management (admin only)
   ```

## Phase 3: Security Features

1. **Role-Based Access Control**
   ```typescript
   // src/lib/auth/rbac.ts
   export const permissions = {
     admin: ['manage_users', 'view_all_jobs', 'manage_system'],
     manager: ['view_team_jobs', 'assign_jobs'],
     operational: ['view_own_jobs', 'update_job_status']
   };
   ```

2. **Protected Routes**
   ```typescript
   // src/middleware.ts
   export default function middleware(req: NextRequest) {
     const session = await getToken({ req });
     if (!session) return NextResponse.redirect('/login');
     
     // Role-based redirects
     if (req.nextUrl.pathname.startsWith('/admin') && session.role !== 'admin') {
       return NextResponse.redirect('/dashboard');
     }
   }
   ```

## Phase 4: Testing

1. **Authentication Tests**
   ```typescript
   // Tests to implement:
   - Login flow
   - Password change
   - Session persistence
   - Role-based access
   ```

2. **User Management Tests**
   ```typescript
   // Tests to implement:
   - User creation
   - Profile updates
   - Password resets
   - Role changes
   ```

## Phase 5: Deployment

1. **Environment Setup**
   ```bash
   # Required env vars:
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

2. **Database Migrations**
   ```sql
   -- Create migration scripts for:
   1. Initial schema
   2. User roles and permissions
   3. Indexes and constraints
   ```

## Important Notes

1. **Security Considerations**
   - Use service role key only on server
   - Hash passwords with bcrypt
   - Validate all user input
   - Use server actions for mutations

2. **Hydration Handling**
   - Use mounting checks in client components
   - Match server/client HTML structure
   - Handle loading states properly
   - Use Suspense boundaries

3. **Error Handling**
   - Implement proper error boundaries
   - Log errors server-side
   - Show user-friendly messages
   - Handle common edge cases
