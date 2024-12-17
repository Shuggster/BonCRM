# Tasks System Documentation

## Overview
The tasks system allows users to create, manage, and track tasks within the CRM. Each task has properties like title, description, status, priority, and due date.

## Database Schema

### Tasks Table
The tasks table is structured as follows:

```sql
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    related_event UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL
)
```

### Field Descriptions
- `id`: Unique identifier for the task
- `title`: Task title (required)
- `description`: Detailed description of the task (optional)
- `status`: Current status of the task (required)
  - Valid values: 'todo', 'in-progress', 'completed'
- `priority`: Task priority level (required)
  - Valid values: 'low', 'medium', 'high'
- `due_date`: When the task is due (optional)
- `assigned_to`: UUID of the user assigned to the task (optional)
- `related_event`: UUID of a related calendar event (optional)
- `created_at`: Timestamp when the task was created
- `updated_at`: Timestamp when the task was last updated
- `user_id`: UUID of the user who created the task

## Security

### Authentication Architecture

The system uses a dual-layer authentication approach:

1. **Primary Authentication: NextAuth.js**
   - Uses JWT strategy with 24-hour session duration
   - Handles user sessions and authentication state
   - Configured in `src/lib/auth/options.ts`
   - Uses Credentials provider for email/password login
   - Session contains user ID which is used for data filtering

2. **Database Access: Supabase**
   - Used primarily as a database with RLS policies
   - Two client configurations:
     - Public client (`NEXT_PUBLIC_SUPABASE_ANON_KEY`): For authenticated user operations
     - Service client (`SUPABASE_SERVICE_ROLE_KEY`): For admin operations only

3. **Security Pattern**
   - Server-side authentication gate using NextAuth's `getServerSession()`
   - Pages are protected at the server component level
   - Example:
     ```typescript
     export default async function TasksPage() {
       const session = await getServerSession(authOptions)
       if (!session) {
         return redirect('/login')
       }
       return <TasksClient session={session} />
     }
     ```

### Required Environment Variables
```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_jwt_secret_here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Only for admin operations
```

### Authentication Flow
1. User attempts to access a protected route
2. Server component checks for valid session using `getServerSession()`
3. If no session, redirects to login
4. After login, NextAuth creates a JWT session
5. Session is passed to client components
6. Client components use session.user.id for data filtering in Supabase queries

### Data Access Pattern
```typescript
// Example of correct data filtering in service
async getTasks(session: Session) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)  // Always filter by user_id
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Row Level Security (RLS)
The tasks table uses a simplified RLS policy that allows authenticated users to access tasks:

```sql
CREATE POLICY "Allow authenticated access"
    ON public.tasks
    FOR ALL
    TO PUBLIC
    USING (true);
```

### Important Security Notes

1. **DO NOT Modify**:
   - RLS policies to use `auth.uid()`
   - Supabase client authentication settings
   - Complex authentication checks in RLS policies
   - NextAuth session duration without understanding implications
   - Service role key usage in client-side code

2. **DO Use**:
   - NextAuth's `getServerSession()` for page protection
   - Pass the session to client components
   - Use session's user ID for data filtering in service calls
   - Keep the simplified RLS policies as they are
   - Service role key only in admin scripts or secure server endpoints

3. **Security Layers**:
   - Primary security handled by NextAuth at server level
   - Supabase anon key has limited permissions
   - API endpoints protected by CORS settings
   - Service role key never leaves server
   - Data filtering always applied at the service level

### Troubleshooting Common Issues
1. **Unauthorized Access**
   - Check if `getServerSession()` is implemented in the page
   - Verify environment variables are correctly set
   - Ensure session is being passed to client components

2. **Data Not Filtering Correctly**
   - Verify user_id is being used in service queries
   - Check session object contains correct user information
   - Ensure service is receiving session parameter

3. **Authentication Errors**
   - Verify NextAuth secret is properly set
   - Check Supabase URL and keys are correct
   - Ensure database tables have correct RLS policies

## Usage

### Creating a Task
When creating a task, ensure to provide valid values for the required fields:

```typescript
const task = {
  title: "Example Task",       // required
  description: "Details...",   // optional
  status: "todo",             // required: 'todo', 'in-progress', 'completed'
  priority: "medium",         // required: 'low', 'medium', 'high'
  due_date: new Date(),       // optional
  assigned_to: null,          // optional: UUID of assigned user
  related_event: null         // optional: UUID of related event
};
```

### Updating Task Status
Task status can only be set to one of these values:
- 'todo'
- 'in-progress'
- 'completed'

### Setting Priority
Task priority can only be set to one of these values:
- 'low'
- 'medium'
- 'high'
