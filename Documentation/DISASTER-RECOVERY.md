# Lovable CRM: Disaster Recovery & System Guide

## CRITICAL: READ FIRST
This document is the source of truth for system architecture and recovery procedures. Any agent working on this system MUST read and understand this document before making changes.

## 1. Authentication System

### Architecture Overview
- **Primary Auth**: NextAuth.js with JWT strategy
- **Database**: Supabase with Row Level Security (RLS)
- **Key Management**:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: For client-side operations
  - `SUPABASE_SERVICE_ROLE_KEY`: For server-side operations ONLY

### Authentication Flow
1. User accesses protected route
2. NextAuth middleware checks session
3. If no session → redirect to login
4. On login → NextAuth verifies credentials
5. On success → JWT token issued
6. Protected routes accessible with valid session

### Critical Rules
1. NEVER use service role key on client side
2. NEVER bypass RLS policies
3. ALWAYS use server endpoints for write operations
4. ALWAYS validate session before database operations

## 2. Component Access Pattern

### Tasks
```typescript
// Client-side read operations
const { data } = await supabase.from('tasks').select()

// Write operations MUST use server endpoint
await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify(taskData)
})
```

### Contacts
```typescript
// Similar pattern to tasks
const { data } = await supabase.from('contacts').select()

// Write operations via server
await fetch('/api/contacts', {
  method: 'POST',
  body: JSON.stringify(contactData)
})
```

## 3. Database Recovery Procedures

### A. Basic Recovery
If you encounter permission errors or unexpected behavior:

1. First, verify RLS policies:
```sql
SELECT tablename, policies 
FROM pg_policies 
WHERE schemaname = 'public';
```

2. Restore default RLS state:
```sql
-- Disable RLS to match working state
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;
GRANT ALL ON tasks TO anon;
```

### B. Full Database Reset
If you need to rebuild the database:

1. Backup existing data:
```sql
CREATE TABLE IF NOT EXISTS tasks_backup AS SELECT * FROM tasks;
CREATE TABLE IF NOT EXISTS contacts_backup AS SELECT * FROM contacts;
```

2. Drop and recreate tables:
```sql
-- Tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    task_group_id UUID REFERENCES task_groups(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Task activities table (no user dependency)
CREATE TABLE public.task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);
```

3. Restore RLS settings:
```sql
-- Disable RLS as per working configuration
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;
GRANT ALL ON tasks TO anon;
```

## 4. Common Issues & Solutions

### A. Permission Errors
If you see "permission denied" errors:
1. Check if operation is client or server-side
2. For client-side: Ensure RLS is disabled or policies are correct
3. For server-side: Verify service role key is being used

### B. Invalid Time Value Errors
When handling dates:
1. Always use `new Date()` before formatting
2. Use ISO strings for database storage
3. Parse dates on retrieval:
```typescript
dueDate: row.due_date ? new Date(row.due_date) : undefined
```

### C. Foreign Key Violations
If you encounter foreign key errors:
1. Check table dependencies
2. Verify cascading deletes are set up
3. Remove or update foreign key constraints if needed

## 5. Maintenance Guidelines

### A. Before Making Changes
1. Read this entire document
2. Understand the authentication flow
3. Know which key (anon vs service) to use
4. Test changes in isolation

### B. After Making Changes
1. Verify RLS policies are correct
2. Test both read and write operations
3. Document any schema changes
4. Update this guide if needed

## 6. Environment Setup

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
```

## 7. Standard Patterns

### A. Error Handling
```typescript
// Client-side error handling
try {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const result = await response.json()
} catch (error) {
  console.error('Failed to create task:', error)
  toast.error('Failed to create task')
}

// Server-side error handling
export async function POST(req: Request) {
  try {
    // Validate session
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse and validate body
    const body = await req.json()
    if (!body.title) {
      return new Response('Title is required', { status: 400 })
    }

    // Database operation
    const { data, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### B. API Response Format
All API endpoints should follow this format:
```typescript
// Success response
{
  data: T,  // Type depends on endpoint
  error: null
}

// Error response
{
  data: null,
  error: {
    code: string,    // e.g., 'UNAUTHORIZED'
    message: string, // User-friendly message
    details?: any    // Optional technical details
  }
}
```

### C. State Management
1. **Server State**: Use React Query for:
   - Tasks
   - Contacts
   - Calendar events
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['tasks'],
     queryFn: () => taskService.getTasks()
   })
   ```

2. **UI State**: Use React state for:
   - Modal visibility
   - Form values
   - Filter/sort preferences

### D. Calendar Implementation
1. **Event Creation**:
   ```typescript
   // Always use ISO strings for dates
   const event = {
     start: new Date(startDate).toISOString(),
     end: new Date(endDate).toISOString(),
     title: string,
     description?: string
   }
   ```

2. **Date Handling**:
   - Store dates in UTC
   - Convert to local time for display
   - Use date-fns for formatting

3. **Recurring Events**:
   - Store base event + recurrence rule
   - Generate instances on-the-fly
   - Handle exceptions separately

## 8. Development Guidelines

### A. Code Organization
1. **API Routes**: `/app/api/[resource]/route.ts`
2. **Components**: 
   - UI components in `components/ui`
   - Feature components with their routes
3. **Services**: All database operations in `lib/supabase/services`

### B. Naming Conventions
1. **Files**:
   - Components: PascalCase (e.g., `TaskList.tsx`)
   - Utils: camelCase (e.g., `dateUtils.ts`)
   - Routes: kebab-case (e.g., `task-groups`)

2. **Functions**:
   - React components: PascalCase
   - Hooks: use* prefix
   - Utils: camelCase

### C. Testing
1. **Manual Testing Checklist**:
   - [ ] Create/Edit/Delete operations
   - [ ] Date handling
   - [ ] Error scenarios
   - [ ] Loading states
   - [ ] Mobile responsiveness

## IMPORTANT NOTES
1. This system uses NextAuth as the primary authentication method
2. Supabase is used primarily as a database
3. All write operations should go through server endpoints
4. RLS is intentionally disabled for simplicity
5. The service role key must NEVER be exposed to the client

Remember: When in doubt, refer to this document first before making any changes.
