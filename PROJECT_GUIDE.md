# Project Guide

## Debugging Best Practices

### Avoiding Over-Engineering

### Case Study: The One-Line Fix
A recent debugging session highlighted a critical lesson in maintaining code simplicity:
- Problem: Calendar events disappeared after a code change
- Simple Fix: Restoring one line from `return []` to `return [event]` in recurrence.ts
- Time Wasted: Over 1 hour trying complex solutions
- Actual Fix Time: 1 minute

### Key Lessons Learned
1. Start With the Simplest Explanation
   - Before diving into complex solutions, check if something simple was changed
   - Look for recent code changes that coincide with the problem
   - Test the most basic fix first

2. Follow the Data Flow
   - When data disappears, trace backward from where it should appear
   - Look for functions that return empty results
   - Check array transformations and filters

3. Listen to User Guidance
   - When users say "don't change anything else", they often have a good reason
   - Resist the urge to "improve" other parts of the code while fixing a bug
   - Focus on the specific issue reported

4. Make Incremental Changes
   - Test one change at a time
   - Revert immediately if a change doesn't fix the issue
   - Keep track of what was changed

### Prevention Guidelines
1. Before Making Changes:
   - Document the current working state
   - Understand why the current code works
   - Question whether a change is really needed

2. When Debugging:
   - Start with the most recent changes
   - Look for simple explanations first
   - Test the smallest possible fix
   - Don't touch working code

3. Code Review Practices:
   - Flag unnecessary complexity
   - Question changes to working code
   - Verify that fixes are minimal and targeted

## System Architecture

### Calendar Module Dependencies
- Calendar events rely on three interconnected systems:
  1. Direct calendar events (calendar_events table)
  2. User assignments (users table)
  3. Team assignments (teams table)
  4. Department filtering (across users and teams)

### Critical Service Dependencies
- Calendar functionality depends on these core services:
  - `getEvents()` - Main event fetching
  - `getUsers()` - User assignment options
  - `getTeams()` - Team assignment options
  - `getDepartments()` - Department filtering

## Common Implementation Patterns

### Assignment Filtering
- Calendar events use a multi-level filtering system:
  1. User-level assignments
  2. Team-level assignments
  3. Department-level filtering
  4. Role-based access (admin vs regular users)

### Data Flow Examples
- Example: Fetching assignable users
  1. Check user role (admin/non-admin)
  2. For non-admin: return only self
  3. For admin: return all users
  4. Filter by department if applicable

### Authentication Patterns
All major modules (Calendar, Tasks, Contacts) follow the same authentication pattern:
1. Server-side session validation using NextAuth
2. Role-based access control
3. Department-level filtering where applicable
4. User-specific data access through Supabase RLS

## Troubleshooting Common Issues

### Missing Assignees
If calendar assignees are not showing:
1. Check if getUsers() and getTeams() functions are present
2. Verify user role permissions
3. Check department filtering logic

### Department Filtering Issues
If department filtering isn't working:
1. Verify department field in users table
2. Check department relationships in teams table
3. Verify getDepartments() is returning expected values

### Authentication Issues
Common auth-related problems and solutions:
1. Session not available
   - Verify getServerSession() is called correctly
   - Check auth-options.ts configuration
2. Permission issues
   - Verify user role in session
   - Check department access rights
3. Data access problems
   - Confirm Supabase RLS policies
   - Verify user_id checks in queries

Remember: The best solution is often the simplest one. If a bug appears after a code change, check that change first before exploring complex solutions. 

## Project Structure Overview

### Core Modules
1. Calendar Module
   - Purpose: Event scheduling and management
   - Key Files: 
     - `src/lib/supabase/services/calendar.ts` - Main service
     - `src/app/(main)/calendar/*` - UI components
     - `src/types/calendar.ts` - Type definitions

2. Tasks Module
   - Purpose: Task management and tracking
   - Key Files:
     - `src/lib/supabase/services/task-calendar.ts` - Main service
     - `src/app/(main)/tasks/*` - UI components
     - `src/types/tasks.ts` - Type definitions

3. Contacts Module
   - Purpose: Contact management and relationships
   - Key Files:
     - `src/lib/supabase/services/contacts.ts` - Main service
     - `src/app/(main)/contacts/*` - UI components
     - `src/types/contacts.ts` - Type definitions

### Shared Infrastructure
- Authentication: `src/app/(auth)/lib/auth-options.ts`
- Database Client: `src/lib/supabase/client.ts`
- Admin Client: `src/app/(auth)/lib/supabase-admin.ts`
- Type Definitions: `src/types/supabase.ts`

## State Management

### Data Flow Patterns
1. Server-Side Data Fetching
   - Uses Supabase service role for admin operations
   - Regular client for user-specific queries
   - Session-based access control

2. Client-Side Updates
   - Optimistic UI updates
   - Server validation
   - Error handling and rollback

### Common State Issues
1. Stale Data
   - Check if real-time subscriptions are needed
   - Verify cache invalidation
   - Look for missing refetch triggers

2. Race Conditions
   - Check async operation ordering
   - Verify loading states
   - Look for concurrent updates

## Database Schema Dependencies

### Key Relationships
1. Users → Departments
   - One-to-many relationship
   - Department filtering affects visibility

2. Events → Assignments
   - Events can be assigned to users or teams
   - Assignments affect visibility and permissions

3. Tasks → Events
   - Tasks can have related calendar events
   - Changes in one affect the other

### Common Schema Issues
1. Missing Foreign Keys
   - Check relationship definitions
   - Verify cascade behaviors
   - Look for orphaned records

2. Incorrect Data Types
   - Date/time format mismatches
   - JSON field structure issues
   - Enum value constraints

## Quick Start for New Issues

### First Steps
1. Identify the module (Calendar/Tasks/Contacts)
2. Check authentication context
3. Verify data flow (server/client)
4. Look for recent changes

### Common Patterns to Check
1. Session Handling
   ```typescript
   if (!session?.user?.id) {
     throw new Error('No user session found')
   }
   ```

2. Data Fetching
   ```typescript
   const { data, error } = await supabaseAdmin
     .from('table_name')
     .select('*')
     .eq('user_id', session.user.id)
   ```

3. Error Handling
   ```typescript
   try {
     // Operation
   } catch (error) {
     console.error('[Service] Operation error:', error)
     throw error
   }
   ```

Remember: The best solution is often the simplest one. If a bug appears after a code change, check that change first before exploring complex solutions. 

## Environment Setup

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3001
PORT=3001
```

### Common Environment Issues
1. Missing SUPABASE_SERVICE_ROLE_KEY
   - Symptoms: Admin operations fail
   - Fix: Check .env.local file
2. Incorrect NEXTAUTH_URL
   - Symptoms: Authentication redirects fail
   - Fix: Must match your deployment URL

## Type System Overview

### Key Type Definitions
1. User Session Types
   ```typescript
   interface UserSession {
     user: {
       id: string
       email: string
       role: 'admin' | 'user'
       department?: string
     }
   }
   ```

2. Common Response Types
   ```typescript
   interface ServiceResponse<T> {
     data?: T
     error?: string
     status: 'success' | 'error'
   }
   ```

### Type Conversion Patterns
- NextAuth → UserSession conversion
- Database → Frontend model conversion
- Date string → Date object handling

## Common Gotchas

### Date Handling
1. Always use ISO strings for storage
2. Convert to Date objects for UI
3. Watch for timezone issues
4. Use consistent date formatting

### State Updates
1. Optimistic Updates
   ```typescript
   // DO THIS
   try {
     // Optimistically update UI
     setEvents([...events, newEvent])
     // Make API call
     await createEvent(newEvent)
   } catch (error) {
     // Rollback on failure
     setEvents(events)
     showError(error)
   }
   ```

2. Batch Updates
   ```typescript
   // AVOID THIS
   events.forEach(async (event) => {
     await updateEvent(event) // Race condition!
   })

   // DO THIS
   await Promise.all(events.map(event => updateEvent(event)))
   ```

### Permission Handling
1. Frontend Checks
   ```typescript
   const canEdit = session?.user?.role === 'admin' || 
                  event.user_id === session?.user?.id

   {canEdit && <EditButton />}
   ```

2. Backend Validation
   ```typescript
   // Always validate on backend too
   if (!isAuthorized(session, resource)) {
     throw new Error('Unauthorized')
   }
   ```

## Testing and Debugging

### Browser Tools
1. Network Tab
   - Watch for 401/403 errors (auth issues)
   - Check request/response payloads
   - Verify correct endpoints

2. Console Patterns
   - [Service] prefixes for service logs
   - [Component] prefixes for component logs
   - Error stack traces

### Common Error Patterns
1. "TypeError: Cannot read property 'X' of undefined"
   - Check null coalescing
   - Verify data loading states
   - Look for race conditions

2. "Unauthorized" or "Missing session"
   - Check auth token expiry
   - Verify session propagation
   - Check RLS policies

## Performance Considerations

### Data Fetching
1. Use appropriate select clauses
   ```typescript
   // BAD: Fetches all fields
   .select('*')

   // GOOD: Only fetch needed fields
   .select('id, title, start_time, end_time')
   ```

2. Implement pagination where needed
   ```typescript
   .select()
   .range(start, end)
   .order('created_at')
   ```

### Component Optimization
1. Use appropriate React hooks
2. Implement proper memoization
3. Watch for unnecessary rerenders

Remember: The best solution is often the simplest one. If a bug appears after a code change, check that change first before exploring complex solutions. 