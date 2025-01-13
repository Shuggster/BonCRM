# Admin Section Database Schema

## Core Tables

### 1. Users Table
```sql
Table: users
- id: uuid (PK)
- email: text
- password_hash: text
- name: text
- role: text ('admin' | 'manager' | 'operational')
- created_at: timestamptz
- updated_at: timestamptz
- department: text
- is_active: boolean
```

### 2. Teams Table
```sql
Table: teams
- id: uuid (PK)
- name: text
- description: text
- department: text
- created_by: uuid (FK -> users.id)
- created_at: timestamptz
- updated_at: timestamptz
```

### 3. Team Members Table
```sql
Table: team_members
- id: uuid (PK)
- team_id: uuid (FK -> teams.id)
- user_id: uuid (FK -> users.id)
- role: text ('leader' | 'member')
- joined_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
Constraints:
- UNIQUE(team_id, user_id)
```

### 4. Role Permissions Table
```sql
Table: role_permissions
- id: uuid (PK)
- role: text
- permission_name: text
- enabled: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

## Security Policies

### Admin Section RLS vs General Components

Unlike general components (Tasks, Calendars, Contacts) which use authenticated-only RLS:
```sql
-- ❌ DO NOT USE THIS FOR ADMIN TABLES
CREATE POLICY "Authenticated access"
ON public.some_table
FOR ALL USING (
    auth.role() = 'authenticated'
);
```

Admin tables require strict role-based RLS:

### Users Table RLS
```sql
-- Select: Authenticated users can read basic info
CREATE POLICY "Users can view basic info"
    ON users FOR SELECT
    USING (auth.role() = 'authenticated');

-- Select: Admins can view all fields
CREATE POLICY "Admins can view all user details"
    ON users FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );

-- Insert/Update/Delete: Only admins
CREATE POLICY "Only admins can modify users"
    ON users
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );
```

### Teams Table RLS
```sql
-- Select: Members can view their teams
CREATE POLICY "Users can view teams they belong to"
    ON teams FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM team_members 
            WHERE team_id = teams.id
        )
    );

-- Insert/Update/Delete: Only admins
CREATE POLICY "Only admins can modify teams"
    ON teams
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );
```

### Role Permissions Table RLS
```sql
-- Select: All authenticated users can view
CREATE POLICY "Users can view role permissions"
    ON role_permissions FOR SELECT
    USING (auth.role() = 'authenticated');

-- Insert/Update/Delete: Only admins
CREATE POLICY "Only admins can modify permissions"
    ON role_permissions
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );
```

## Relationships & Dependencies

1. **Users -> Teams**
   - Users can belong to multiple teams through team_members
   - Users can create teams (created_by)
   - Users have departments that teams can be associated with

2. **Teams -> Users**
   - Teams have members through team_members
   - Teams are created by users
   - Teams belong to departments

3. **Role Permissions**
   - Defines what each role can do
   - Used for granular access control

## Department Values
Valid department options:
- management
- sales
- accounts
- trade_shop

## Role Values
Valid role options:
- admin: Full system access
- manager: Department-level access
- operational: Basic access

## Notes
1. All tables include created_at/updated_at timestamps
2. UUIDs are used for all primary keys
3. Soft delete (is_active) implemented for users
4. Role-based access control implemented through role_permissions
5. Team membership tracked through junction table with role designation 

## Security Implementation Notes

1. **Token Handling**
   - Next.js authentication tokens are still passed, but RLS policies check user roles
   - Admin routes require both valid token AND admin role
   - API routes double-check admin status server-side

2. **RLS Policy Pattern**
   - Read operations: Mix of authenticated and role-based checks
   - Write operations: Strict admin-only policies
   - No public access policies for admin tables

3. **Why Stricter RLS?**
   - Admin tables contain sensitive user data
   - Role management affects system security
   - Team management impacts organizational structure
   - Prevents unauthorized modifications to system configuration 

## Impact Isolation

### Separation of Concerns

1. **RLS Policy Isolation**
```sql
-- Regular component policies remain unchanged
CREATE POLICY "Authenticated access for tasks"
ON public.tasks
FOR ALL USING (
    auth.role() = 'authenticated'
);

-- Admin policies are separate and more restrictive
CREATE POLICY "Admin only for user management"
ON public.users
FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

2. **Route Separation**
```typescript
// Middleware only affects admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}

// Regular routes remain untouched
// /dashboard, /tasks, /contacts, etc.
```

3. **API Endpoint Isolation**
```typescript
// Regular API endpoints - unchanged
/api/tasks     // Authenticated only
/api/contacts  // Authenticated only
/api/calendar  // Authenticated only

// Admin API endpoints - strict checks
/api/admin/users    // Admin only
/api/admin/teams    // Admin only
/api/admin/roles    // Admin only
```

### What Remains Unchanged

1. **Regular Component Access**
   - Dashboard functionality
   - Task management
   - Contact management
   - Calendar operations
   - Activity tracking

2. **Authentication Flow**
   - Login/logout process
   - Token handling
   - Session management
   - Regular user permissions

3. **Data Access Patterns**
   - User-specific data filtering
   - Team-based access
   - Department-level visibility

### Integration Points

1. **Shared Resources**
   - User profile information (read-only for regular access)
   - Team membership data
   - Department associations

2. **Common Infrastructure**
   - Authentication tokens
   - Database connections
   - API request handling

3. **Security Layers**
   - Base authentication (applies to all)
   - Role checks (additional for admin)
   - Permission validation (granular for admin)

This separation ensures that:
- Adding admin features doesn't disrupt existing functionality
- Regular users experience remains unchanged
- Admin operations are properly secured
- System maintains clear boundaries between regular and administrative functions 