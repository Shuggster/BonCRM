# Pre-Session Guide for Lovable CRM

## Project Overview
Lovable CRM is a modern, user-friendly customer relationship management system built for Bonnymans. The system uses Next.js 14, Supabase, and Tailwind CSS with a dark theme design.

## Authentication Architecture
- **Primary Auth**: NextAuth.js with credentials provider
- **Database**: Supabase for data storage (no Supabase Auth)
- **Session Management**: JWT-based with 24-hour duration
- **Access Control**: Role and department-based

## Core Components
1. **Frontend**
   - Next.js 14 with App Router
   - Radix UI components
   - Tailwind CSS styling
   - Dark theme design

2. **Backend**
   - NextAuth.js for authentication
   - Supabase for data storage
   - Protected API routes
   - Server-side validation

3. **Security**
   - Password hashing with bcrypt
   - Role-based access control
   - Department-based organization
   - Protected API endpoints

## Project Structure
```
src/
├── app/
│   ├── api/          # Protected API endpoints
│   ├── (app)/        # Main application routes
│   └── (auth)/       # Authentication routes
├── components/
│   ├── ui/           # Reusable UI components
│   └── admin/        # Admin-specific components
├── lib/
│   ├── auth/         # Authentication utilities
│   ├── supabase/     # Database services
│   └── utils/        # Helper functions
└── types/            # TypeScript definitions
```

## User Management
1. **Roles**
   - admin: Full system access
   - manager: Department-level access
   - operational: Basic access

2. **Departments**
   - management
   - sales
   - accounts
   - trade_shop

3. **Database Schema**
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

## Important Guidelines
1. **Authentication**
   - All admin routes require authenticated session
   - Role verification on protected routes
   - Department-based data access
   - Password hashing on server-side

2. **API Security**
   - Protected routes with session validation
   - Input sanitization and validation
   - Error handling with proper status codes
   - CSRF protection

3. **Database Access**
   - Server-side operations only
   - Role-based access control
   - Department filtering
   - Proper error handling

4. **User Interface**
   - Form validation
   - Loading states
   - Error messages
   - Success notifications

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3001
```

## Key Documentation
1. **USER_CREATION_PROCESS.md**: User creation and management
2. **AUTHENTICATION_REFACTOR_PLAN.md**: Authentication architecture
3. **ADMIN_USER_IMPLEMENTATION.md**: Admin interface details

## Common Patterns
1. **Protected API Routes**
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Route logic here
}
```

2. **Error Handling**
```typescript
try {
  // Operation logic
  if (error) throw new Error('Operation failed')
  return NextResponse.json({ success: true })
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
}
```

3. **Form Validation**
```typescript
if (!email || !password || !name || !role || !department) {
  return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
}
```

## Best Practices
1. **Security**
   - Validate sessions on protected routes
   - Hash passwords server-side
   - Sanitize user input
   - Use proper error handling

2. **Performance**
   - Optimize database queries
   - Use proper loading states
   - Handle errors gracefully
   - Implement proper caching

3. **User Experience**
   - Clear error messages
   - Loading indicators
   - Success notifications
   - Responsive design
