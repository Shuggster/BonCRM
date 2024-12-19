# Lovable CRM: Disaster Recovery & System Guide

## CRITICAL: READ FIRST
This document is the source of truth for system architecture and recovery procedures. Any agent working on this system MUST read and understand this document before making changes.

## 1. Authentication System

### Architecture Overview
- **Primary Auth**: NextAuth.js with credentials provider
- **Database**: Supabase for data storage
- **Session Management**: JWT-based with 24-hour expiry
- **Access Control**: Role and department-based
- **Key Management**:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: For client-side operations
  - `SUPABASE_SERVICE_ROLE_KEY`: For server-side operations ONLY

### User Management
1. **Roles**:
   - admin: Full system access
   - manager: Department-level access
   - operational: Basic access

2. **Departments**:
   - management
   - sales
   - accounts
   - trade_shop

3. **Database Schema**:
```sql
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
```

### Authentication Flow
1. User submits login credentials
2. Server verifies credentials against users table
3. If valid, NextAuth creates session with user role and department
4. Protected routes check session and role/department access
5. Database operations use role/department for filtering

### Critical Rules
1. NEVER use service role key on client side
2. NEVER store plain text passwords
3. ALWAYS hash passwords with bcrypt
4. ALWAYS validate session before database operations
5. ALWAYS check role/department access
6. ALWAYS use server endpoints for write operations

## 2. Component Access Pattern

### Protected API Routes
```typescript
// Base pattern for protected routes
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Role-based access control
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    // Operation logic here
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Database Operations
```typescript
// Read operations with department filtering
const { data } = await supabase
  .from('tasks')
  .select()
  .eq('department', session.user.department)

// Write operations via server endpoints
await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taskData)
})
```

## 3. Recovery Procedures

### A. User Management Recovery
If user management issues occur:

1. Verify users table structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

2. Check role and department constraints:
```sql
SELECT 
  conname AS constraint_name,
  consrc AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass;
```

3. Reset user password if needed:
```sql
-- Generate new password hash
UPDATE users 
SET password_hash = '$2b$...' -- bcrypt hash
WHERE email = 'user@email.com';
```

### B. Session Recovery
If session issues occur:

1. Clear all sessions:
```sql
DELETE FROM sessions;
```

2. Verify NextAuth configuration:
```typescript
// pages/api/auth/[...nextauth].ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "text" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        // Verify credentials implementation
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Verify JWT callback implementation
    },
    session: async ({ session, token }) => {
      // Verify session callback implementation
    }
  }
}
```

## 4. Common Issues & Solutions

### A. Authentication Issues
1. **Invalid Credentials**:
   - Verify email exists in users table
   - Check password hash matches
   - Ensure user is active

2. **Session Expired**:
   - Default session length is 24 hours
   - Check NEXTAUTH_SECRET is consistent
   - Verify JWT token contains required data

3. **Access Denied**:
   - Verify user role is correct
   - Check department access
   - Ensure route protection is working

### B. Database Issues
1. **Role/Department Constraints**:
   - Verify valid role values
   - Check department values
   - Update constraints if needed

2. **User Creation Failures**:
   - Check email uniqueness
   - Verify password hashing
   - Ensure all required fields

## 5. Maintenance Guidelines

### A. User Management
1. Only admins can create users
2. Passwords must be hashed with bcrypt
3. Users must have valid role and department
4. Keep audit trail of user changes

### B. Security Practices
1. Use HTTPS in production
2. Implement rate limiting
3. Validate all user input
4. Log security events
5. Regular security audits

## 6. Environment Setup

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001

# Security Settings
BCRYPT_SALT_ROUNDS=12
```

## 7. Standard Patterns

### A. Error Handling
```typescript
// API error handling
export async function POST(req: Request) {
  try {
    // Session validation
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Role validation
    if (!['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    // Input validation
    const body = await req.json()
    if (!body.required_field) {
      return NextResponse.json({ 
        error: 'Missing required field' 
      }, { status: 400 })
    }

    // Database operation
    const { data, error } = await supabase
      .from('table')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
```

### B. User Management
```typescript
// User creation
async function createUser(userData: CreateUserInput) {
  // Hash password
  const hashedPassword = await bcrypt.hash(
    userData.password, 
    Number(process.env.BCRYPT_SALT_ROUNDS)
  )

  // Create user
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...userData,
      password_hash: hashedPassword,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## IMPORTANT NOTES
1. NextAuth.js is the primary authentication system
2. Supabase is used as a database only
3. All write operations must use server endpoints
4. Password hashing is mandatory
5. Role and department access must be enforced
6. Service role key must NEVER be exposed

Remember: When in doubt, refer to this document first before making any changes.
