# Admin Section Implementation Guide

## Overview
This document outlines the implementation plan for the admin section, ensuring proper integration with existing authentication and system architecture.

## Table of Contents
1. [Current Authentication Structure](#current-authentication-structure)
2. [Admin Section Requirements](#admin-section-requirements)
3. [Implementation Plan](#implementation-plan)
4. [Potential Conflicts](#potential-conflicts)
5. [Testing & Validation](#testing--validation)

## Current Authentication Structure

### Authentication Components
- Primary Auth: NextAuth.js with credentials provider
- Database: Supabase for data storage
- Session Management: JWT-based with 24-hour expiry
- Access Control: Role and department-based

### User Roles
```typescript
type UserRole = 'admin' | 'manager' | 'operational'
type Department = 'management' | 'sales' | 'accounts' | 'trade_shop'
```

## Admin Section Requirements

### 1. Access Control Layer
```typescript
// Admin route protection middleware
export async function adminGuard(session: Session | null) {
  if (!session?.user) return false;
  if (session.user.role !== 'admin') return false;
  return true;
}

// Admin API route protection
export async function protectedAdminRoute(handler: RouteHandler) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);
    if (!await adminGuard(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, session);
  };
}
```

### 2. Directory Structure
```
src/
└── app/
    └── (admin)/           # Admin route group
        ├── layout.tsx     # Admin layout with auth check
        ├── page.tsx       # Admin dashboard
        └── components/    # Admin-specific components
            ├── user-management/
            ├── team-management/
            └── role-management/
```

### 3. Component Architecture
Each admin component should:
- Be isolated from main app components
- Use lowercase imports consistently
- Implement proper error boundaries
- Maintain its own state management

## Implementation Plan

### Phase 1: Infrastructure Setup
1. **Admin Layout Implementation**
   ```typescript
   // src/app/(admin)/layout.tsx
   export default function AdminLayout({ children }: { children: React.ReactNode }) {
     const { data: session } = useSession();
     const router = useRouter();

     useEffect(() => {
       if (!session?.user || session.user.role !== 'admin') {
         router.push('/');
       }
     }, [session, router]);

     return (
       <div className="admin-layout">
         <AdminNavigation />
         <main>{children}</main>
       </div>
     );
   }
   ```

2. **Admin Middleware**
   ```typescript
   // middleware.ts
   export const config = {
     matcher: '/admin/:path*'
   }

   export default function middleware(req: NextRequest) {
     const token = req.cookies.get('next-auth.session-token');
     if (!token) return NextResponse.redirect(new URL('/login', req.url));
     // Additional admin role verification
   }
   ```

### Phase 2: Core Components Implementation

1. **User Management**
   - User CRUD operations
   - Role assignment
   - Department management
   - Activity logging

2. **Team Management**
   - Team creation/editing
   - Member assignment
   - Permission management
   - Team hierarchy

3. **Role Management**
   - Role definition
   - Permission assignment
   - Access control management
   - Audit logging

## Potential Conflicts

### 1. Authentication Conflicts
- **Risk**: Mixing admin and regular auth flows
- **Prevention**: 
  - Separate admin middleware
  - Dedicated admin session checks
  - Isolated admin API routes

### 2. Component Naming
- **Risk**: Case sensitivity issues in imports
- **Prevention**:
  - Use lowercase for all imports
  - Consistent naming convention
  - Component isolation

### 3. Database Access
- **Risk**: Unauthorized access to admin operations
- **Prevention**:
  - Server-side validation
  - Role-based filtering
  - Audit logging

## Testing & Validation

### 1. Authentication Testing
```typescript
describe('Admin Authentication', () => {
  test('blocks non-admin users', async () => {
    // Test admin route access
  });

  test('allows admin access', async () => {
    // Test admin functionality
  });
});
```

### 2. Component Testing
- Verify component isolation
- Test error boundaries
- Validate state management
- Check responsive design

### 3. Integration Testing
- End-to-end admin flows
- Cross-browser testing
- Performance validation
- Security testing

## Implementation Checklist

### Pre-Implementation
- [ ] Review existing auth structure
- [ ] Identify potential conflicts
- [ ] Create test environment
- [ ] Document current state

### Phase 1
- [ ] Set up admin layout
- [ ] Implement middleware
- [ ] Create base components
- [ ] Test auth flow

### Phase 2
- [ ] Implement user management
- [ ] Create team management
- [ ] Add role management
- [ ] Test all features

### Phase 3
- [ ] Security audit
- [ ] Performance testing
- [ ] Documentation update
- [ ] User acceptance testing

## Maintenance Notes

1. **Regular Checks**
   - Auth flow validation
   - Permission verification
   - Database integrity
   - Performance monitoring

2. **Update Procedures**
   - Document all changes
   - Test in staging
   - Gradual rollout
   - Monitor metrics

## Emergency Recovery

If issues occur:
1. Verify auth flow integrity
2. Check role assignments
3. Validate database state
4. Review audit logs
5. Roll back if necessary

## References
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.io/docs)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

## Admin Implementation Guide

### User Management Implementation Progress

#### Completed Features
- ✅ Basic three-column layout implementation
  - Left column: Navigation (from main layout)
  - Middle column: User list with search
  - Right column: User details/create form
- ✅ User list view showing:
  - User avatar with initials
  - Name and email
  - Role and department
  - Total user count
- ✅ User details view with:
  - User avatar
  - Basic information display
  - Role and department info
- ✅ Create user functionality with:
  - Name, email, role, and department fields
  - Temporary password hash generation
  - Database integration

#### Technical Notes & Lessons Learned

1. Layout Structure
   - The three-column layout should leverage the existing main layout's left navigation
   - Middle column requires minimum width to prevent content cutoff
   - Right panel should be properly sized for forms and details

2. Database Integration
   - Users table requires a `password_hash` field that cannot be null
   - Temporary solution: Generate base64 encoded UUID for password_hash
   - Future improvement needed: Implement proper password management system

3. Form Handling
   - Use controlled components for form inputs
   - Implement proper validation before submission
   - Handle all required fields according to schema

4. Common Issues & Solutions
   - Layout overlapping: Fixed by proper width constraints and flex layout
   - Form submission: Required proper handling of password_hash field
   - Event handling: Ensure proper event propagation in nested components

### Next Steps
1. Implement proper password management system
2. Add user role management
3. Add user activation/deactivation
4. Implement proper error handling and validation
5. Add user edit functionality
6. Implement proper user deletion with safeguards

### Security Considerations
- Current password handling is temporary and needs proper implementation
- Need to implement proper role-based access control
- Consider adding audit logging for user management actions
- Implement proper validation and sanitization of user inputs

### UI/UX Improvements Needed
- Add loading states for all actions
- Improve error message display
- Add confirmation dialogs for critical actions
- Implement proper form validation feedback 

### Page Creation Guide

#### Directory Structure
For new admin pages, follow this structure:
```
src/app/(main)/admin/[feature]/
├── @split/
│   ├── default.tsx    # Default split view content
│   ├── [id]/         # Dynamic routes for item details
│   │   └── page.tsx
│   └── page.tsx      # Split view implementation
├── layout.tsx        # Page layout (if needed)
└── page.tsx         # Main page content
```

#### Implementation Steps
1. Create the base page in `page.tsx`
   - Use "use client" directive
   - Implement the main list view
   - Handle data fetching and state management

2. Set up split view routing
   - Create `@split` directory for parallel routing
   - Implement default.tsx for empty state
   - Add dynamic routes for item details

3. Component Organization
   - Place reusable components in `src/components/admin/[feature]/`
   - Use contexts for complex state management
   - Keep form components separate for maintainability

4. Best Practices
   - Follow existing patterns from contacts/users pages
   - Maintain consistent styling with shadcn/ui components
   - Use proper TypeScript types for all components
   - Keep layout simple: list view in middle, details on right

5. Common Pitfalls to Avoid
   - Don't modify core layout components
   - Avoid nested layouts unless necessary
   - Don't duplicate existing functionality
   - Keep split view implementation consistent 

### Missing Features to Implement

#### User Management Enhancements
1. User Editing
   - Add edit functionality for existing users
   - Implement PATCH endpoint for updates
   - Pre-fill form with user data
   - Handle form state transitions

2. Role Management
   - Add visual role indicators
   - Implement role-based styling:
     ```typescript
     const roleStyles = {
       admin: "bg-blue-500/20 text-blue-400",
       manager: "bg-green-500/20 text-green-400",
       operational: "bg-yellow-500/20 text-yellow-400"
     }
     ```
   - Add role validation

3. Department Configuration
   - Add predefined department options:
     - Management
     - Sales
     - Accounts
     - Trade Shop
   - Implement department validation
   - Add default department handling

4. Form Improvements
   - Add temporary password field for new users
   - Implement form validation
   - Add loading states
   - Add success/error notifications
   - Add cancel functionality
   - Improve error handling

5. UI/UX Enhancements
   - Add toast notifications for actions
   - Implement proper loading states
   - Add confirmation dialogs
   - Improve form feedback
   - Add visual indicators for selected user 