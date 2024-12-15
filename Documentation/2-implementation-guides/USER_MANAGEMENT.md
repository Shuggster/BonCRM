# User Management Implementation Guide

## Overview
The user management system handles user creation, authentication, and role-based access control.

## User Roles

### 1. Admin
```typescript
interface AdminRole {
    role: 'admin';
    permissions: {
        users: 'crud';      // Create, Read, Update, Delete
        system: 'crud';     // System configuration
        reports: 'crud';    // All reports
        contacts: 'crud';   // All contacts
    };
}
```

### 2. Senior Management
```typescript
interface SeniorManagementRole {
    role: 'senior_management';
    permissions: {
        users: 'r';         // Read only
        system: 'r';        // Read only
        reports: 'crud';    // All reports
        contacts: 'crud';   // All contacts
    };
}
```

### 3. Department Manager
```typescript
interface DepartmentManagerRole {
    role: 'department_manager';
    permissions: {
        users: 'r';         // Read only (department)
        reports: 'crud';    // Department reports
        contacts: 'crud';   // Department contacts
        tasks: 'crud';      // Department tasks
    };
}
```

### 4. Operational
```typescript
interface OperationalRole {
    role: 'operational';
    permissions: {
        contacts: 'crud';   // Assigned contacts
        tasks: 'crud';      // Personal tasks
        reports: 'r';       // Basic reports
    };
}
```

## Implementation Steps

### 1. User Creation
```typescript
async function createUser({
    email,
    password,
    name,
    role
}: CreateUserInput) {
    // 1. Create auth user
    const { user, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { role, name }
        }
    })

    if (authError) throw authError

    // 2. Create user record
    const { error: dbError } = await supabase
        .from('users')
        .insert([{
            id: user.id,
            email,
            name,
            role
        }])

    if (dbError) throw dbError

    return user
}
```

### 2. Role Assignment
```typescript
async function assignRole(userId: string, role: Role) {
    const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

    if (error) throw error
}
```

### 3. Access Control
```typescript
// Middleware for role-based access
export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const token = request.nextauth.token
        const role = token?.role as Role

        // Check route permissions
        if (!hasPermission(role, request.nextUrl.pathname)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)
```

## User Interfaces

### 1. User Management Dashboard
```typescript
interface UserTableRow {
    id: string
    name: string
    email: string
    role: Role
    department?: string
    lastActive: Date
    status: 'active' | 'inactive'
}
```

### 2. User Creation Form
```typescript
interface UserFormData {
    email: string
    password: string
    name: string
    role: Role
    department?: string
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins manage users"
    ON users FOR ALL
    USING (auth.jwt()->>'role' = 'admin');
```

## API Endpoints

### 1. User Management
```typescript
// Create User
POST /api/users
Body: CreateUserInput

// Update User
PATCH /api/users/:id
Body: UpdateUserInput

// Delete User
DELETE /api/users/:id

// List Users
GET /api/users
Query: {
    page: number
    limit: number
    role?: Role
    department?: string
}
```

### 2. Role Management
```typescript
// Assign Role
POST /api/users/:id/role
Body: {
    role: Role
}

// Get Role Permissions
GET /api/roles/:role/permissions
```

## Error Handling

### 1. User Creation Errors
```typescript
interface UserCreationError {
    code: 
        | 'EMAIL_EXISTS'
        | 'INVALID_ROLE'
        | 'INVALID_DEPARTMENT'
        | 'UNAUTHORIZED';
    message: string;
    details?: any;
}
```

### 2. Role Assignment Errors
```typescript
interface RoleAssignmentError {
    code:
        | 'INVALID_ROLE'
        | 'UNAUTHORIZED'
        | 'USER_NOT_FOUND';
    message: string;
}
```

## Testing

### 1. User Creation Tests
```typescript
describe('User Creation', () => {
    test('Creates admin user successfully')
    test('Creates department manager with department')
    test('Handles duplicate email')
    test('Validates role assignment')
})
```

### 2. Access Control Tests
```typescript
describe('Access Control', () => {
    test('Admin can access all routes')
    test('Department manager restricted to department')
    test('Operational user restricted to assigned tasks')
})
```

## Deployment Checklist

1. **Database**
   - [ ] Users table created
   - [ ] RLS policies enabled
   - [ ] Indexes created
   - [ ] Migrations tested

2. **Authentication**
   - [ ] JWT configuration
   - [ ] Role validation
   - [ ] Session management

3. **UI Components**
   - [ ] User management dashboard
   - [ ] Role assignment interface
   - [ ] Error handling
   - [ ] Loading states

4. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Role-based access tests
   - [ ] Error handling tests
