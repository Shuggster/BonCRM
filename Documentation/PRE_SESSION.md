# Pre-Session Guide for Lovable CRM

## Project Overview
Lovable CRM is a modern, user-friendly customer relationship management system built for Bonnymans. The system uses Next.js 14, Supabase, and Tailwind CSS with a dark theme design.

## Critical Information
- **Authentication**: NextAuth.js handles primary authentication, Supabase is used as a database
- **Database Access**: RLS is disabled for simplicity
- **Write Operations**: MUST use server endpoints with service role key
- **Client Operations**: Use anon key only

## Key Components
1. **Frontend**: Next.js 14 with App Router
2. **Database**: Supabase (primarily for data storage)
3. **Authentication**: NextAuth.js (primary auth system)
4. **Styling**: Tailwind CSS with shadcn/ui components

## Project Structure
```
src/
├── app/
│   ├── api/        # Server endpoints (use service role key)
│   └── (main)/     # Main application routes
├── components/     # Reusable components
├── lib/
│   ├── supabase/  # Database services
│   └── utils/     # Utility functions
└── types/         # TypeScript definitions
```

## Core Features
1. **Tasks**
   - Create, update, delete tasks
   - Task groups and activities
   - Due date tracking

2. **Contacts**
   - Contact management
   - Activity scheduling
   - Notes and history

## Important Guidelines
1. NEVER use service role key on client side
2. All write operations must go through `/api` endpoints
3. Date handling requires explicit `new Date()` parsing
4. No direct user management - handled by NextAuth
5. Follow standard error handling patterns
6. Use React Query for server state
7. Follow API response format standards

## Standard Patterns to Follow
1. **Error Handling**: Try-catch with proper error responses
2. **State Management**: React Query for server state
3. **Date Handling**: Always use ISO strings in storage
4. **API Format**: Consistent success/error response format

For detailed implementation of these patterns, see DISASTER-RECOVERY.md.

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
```

## Key Files
1. **DISASTER-RECOVERY.md**: Primary reference for system architecture and recovery
2. **COMPONENT_STRUCTURE.md**: UI component organization
3. **STYLING_GUIDE.md**: UI consistency guidelines

## Before Making Changes
1. Read DISASTER-RECOVERY.md completely
2. Understand the authentication flow
3. Know which key to use (anon vs service)
4. Test changes in isolation

## Common Pitfalls to Avoid
1. Using service role key on client side
2. Bypassing server endpoints for write operations
3. Not parsing dates properly
4. Trying to implement user management (use NextAuth)
