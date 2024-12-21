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

### C. Task Assignment Recovery
If task assignment issues occur:

#### Critical Rules
1. Task assignments MUST be validated
2. User assignments MUST reference public.users
3. Team assignments MUST reference teams table
4. NEVER skip validation on POST or PUT

#### Recovery Steps
If assignment issues occur:

1. Verify task table constraints:
```sql
SELECT 
  conname AS constraint_name,
  consrc AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass;
```

2. Check for invalid assignments:
```sql
-- Find invalid user assignments
SELECT t.id, t.assigned_to, t.assigned_to_type
FROM tasks t
LEFT JOIN users u ON t.assigned_to = u.id
WHERE t.assigned_to_type = 'user'
AND u.id IS NULL;

-- Find invalid team assignments
SELECT t.id, t.assigned_to, t.assigned_to_type
FROM tasks t
LEFT JOIN teams tm ON t.assigned_to = tm.id
WHERE t.assigned_to_type = 'team'
AND tm.id IS NULL;
```

3. Fix invalid assignments:
```sql
-- Clear invalid assignments
UPDATE tasks
SET assigned_to = NULL,
    assigned_to_type = NULL
WHERE id IN (
  SELECT t.id
  FROM tasks t
  LEFT JOIN users u ON t.assigned_to = u.id
  WHERE t.assigned_to_type = 'user'
  AND u.id IS NULL
);
```

#### Prevention Checklist
- [ ] Assignment validation in POST routes
- [ ] Assignment validation in PUT routes
- [ ] Database constraints on assigned_to
- [ ] Type checking on assigned_to_type
- [ ] User existence verification
- [ ] Team existence verification

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

# Disaster Recovery Plan

## Database Issues

### Tag Management Issues
1. **Problem**: Tag references in contacts table not matching tag table structure
   - Symptoms: 
     - Invalid UUID errors when fetching tags
     - "Error fetching tag: invalid input syntax for type uuid"
     - Tags showing as IDs instead of names
   - Cause: 
     - Multiple tag tables (contact_tags and tags)
     - Mixed storage of tag names and UUIDs
     - Legacy data using string names instead of UUIDs
   
   **Solution**:
   ```sql
   -- Create function to validate UUIDs
   CREATE OR REPLACE FUNCTION is_uuid(str text)
   RETURNS boolean AS $$
   BEGIN
     RETURN str ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
   EXCEPTION
     WHEN OTHERS THEN
       RETURN false;
   END;
   $$ LANGUAGE plpgsql;

   -- Clean up invalid tag references
   UPDATE contacts 
   SET tags = ARRAY(
     SELECT DISTINCT unnest(tags) tag_id
     FROM contacts, unnest(tags) tag_id
     WHERE is_uuid(tag_id::text) AND EXISTS (
       SELECT 1 FROM tags WHERE id = tag_id::uuid
     )
   )
   WHERE tags IS NOT NULL;
   ```

2. **Problem**: Multiple tag storage locations
   - Symptoms:
     - Inconsistent tag data
     - 404 errors when accessing contact_tags table
   - Cause:
     - Legacy tag table still in use
     - References to old table in code
   
   **Solution**:
   - Drop old tag tables: `DROP TABLE IF EXISTS contact_tags CASCADE;`
   - Use single source of truth: `tags` table
   - Update all tag queries to use proper table

### Assignment Field Issues
1. **Problem**: Missing assignment fields in database
   - Symptoms:
     - "Could not find the 'assigned_to' column"
     - Foreign key constraint violations
   
   **Solution**:
   ```sql
   ALTER TABLE contacts 
   ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id),
   ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
   ADD COLUMN IF NOT EXISTS department TEXT;
   ```

## Component Recovery

### Tag Component Issues
1. **Problem**: Tag display showing UUIDs instead of names
   - Symptoms:
     - Raw UUIDs displayed in UI
     - Missing tag colors and formatting
   
   **Solution**:
   - Update components to fetch complete tag details
   - Use proper error handling for missing tags
   - Implement fallback display for invalid tags

2. **Problem**: Tag query errors (406 Not Acceptable)
   - Symptoms:
     - 406 errors when fetching tags
     - PGRST116 errors (multiple rows returned)
   
   **Solution**:
   - Use `.maybeSingle()` instead of `.single()`
   - Implement proper error handling
   - Add type checking for tag IDs

## Data Migration

### Contact Data Migration
1. **Problem**: Legacy data formats
   - Symptoms:
     - Mixed data types in tags field
     - Invalid references to old tables
   
   **Solution**:
   - Create migration scripts to clean data
   - Validate data before migration
   - Keep backup of old data
   ```sql
   -- Backup old data
   CREATE TABLE contacts_backup AS SELECT * FROM contacts;
   
   -- Clean up data
   UPDATE contacts SET tags = '{}' WHERE tags IS NULL;
   UPDATE contacts SET tags = ARRAY[]::uuid[] WHERE tags = '{}';
   ```

## Prevention Strategies

1. **Schema Validation**
   - Implement strict type checking
   - Use enums for constrained values
   - Add foreign key constraints

2. **Component Testing**
   - Test with invalid data
   - Verify error handling
   - Check component state management

3. **Database Maintenance**
   - Regular schema validation
   - Clean up unused tables
   - Monitor foreign key integrity

4. **Code Organization**
   - Single source of truth for data
   - Consistent naming conventions
   - Clear separation of concerns

## Recovery Steps

1. **Database Issues**
   - Check schema consistency
   - Validate foreign key relationships
   - Clean up invalid references

2. **Component Issues**
   - Verify data fetching
   - Check error handling
   - Test edge cases

3. **Data Migration**
   - Backup before changes
   - Validate data integrity
   - Test migration scripts

Remember to always:
1. Backup data before major changes
2. Test migrations on staging
3. Document all schema changes
4. Keep track of deprecated tables/columns
