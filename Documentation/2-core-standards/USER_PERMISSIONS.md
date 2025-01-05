# User Permissions and Access Control

## Overview
The CRM implements a multi-layered permission system combining user roles, departments, organizations, and team memberships. This document outlines the core components and implementation details of the permission system.

## Database Structure

### Users Table
The foundation of user management storing core user information:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Organizations
Manages user membership and roles within organizations:
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Teams Structure
Team-based grouping and permissions:
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
```

## Role Types and Access Levels

### User Roles
- **admin**: Full system access and user management capabilities
- **manager**: Department-level access and team management
- **operational**: Standard operational access based on department

### Departments
- **management**: Senior management and system administration
- **sales**: Sales and customer management
- **accounts**: Financial and accounting operations
- **trade_shop**: Trade shop operations and management

## Access Control Implementation

### Authentication Flow
1. User submits login credentials
2. Server verifies credentials against users table
3. NextAuth creates session with user role and department
4. Protected routes check session and role/department access
5. Database operations use role/department for filtering

### Row Level Security (RLS)
The system uses Supabase RLS policies to enforce access control at the database level:
- Users can only access records within their department
- Managers can access all records in their department
- Admins have full access across departments

### Critical Security Rules
1. NEVER use service role key on client side
2. NEVER store plain text passwords
3. ALWAYS validate session before database operations
4. ALWAYS check role/department access
5. ALWAYS use server endpoints for write operations

## Admin Interface

The admin interface (`/admin/users`) provides capabilities for:
- Creating new users
- Assigning roles and departments
- Managing team memberships
- Activating/deactivating users
- Managing organization access

## Example: Protected Route Implementation
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Role-based access control
  if (!hasRequiredRole(session.user, ['admin', 'manager'])) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Department-based filtering
  const departmentFilter = session.user.role === 'admin' 
    ? {} 
    : { department: session.user.department }

  // Proceed with operation...
}
``` 