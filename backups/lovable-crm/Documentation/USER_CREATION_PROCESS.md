# User Creation and Authentication Process

This document outlines the current process for creating and managing users in the Lovable CRM system.

## Overview

The system uses a combination of NextAuth.js for authentication and Supabase for data storage. User management is handled through a dedicated admin interface with role-based access control.

## Authentication Architecture

### Primary Components
1. **NextAuth.js**: Primary authentication provider
   - Handles user sessions and JWT tokens
   - Uses credentials provider with email/password
   - Session data includes: id, email, name, role, department

2. **Supabase Database**: User data storage
   - `users` table stores user profiles and credentials
   - Uses bcrypt for password hashing
   - Direct database access (not Supabase Auth)

### User Management Interface

The system includes a dedicated user management interface accessible to admin users at `/admin/users`. This interface provides:

1. **User Creation**
   - Form-based user creation with validation
   - Role and department selection via dropdowns
   - Automatic password hashing
   - Real-time feedback on creation status

2. **User Listing**
   - Grid display of all users
   - Shows email, name, role, and department
   - Status indicators for active/inactive users

3. **User Actions**
   - Delete user functionality
   - Edit user details (name, role, department)
   - Status management

## User Creation Process

### Via Admin Interface
1. Navigate to `/admin/users`
2. Click "Add User" button
3. Fill in required fields:
   - Email (must be unique)
   - Password
   - Full Name
   - Role (admin, manager, or operational)
   - Department (management, sales, accounts, or trade_shop)
4. Submit form

### Database Schema
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

### API Implementation
The user creation API (`/api/admin/users`) handles:
- Input validation
- Password hashing
- Database insertion
- Error handling
- Success confirmation

## Security Considerations

1. **Authentication**
   - All admin routes require authenticated session
   - Role-based access control (admin only)
   - Session timeout after 24 hours

2. **Password Security**
   - Passwords are hashed using bcrypt
   - Minimum password requirements enforced
   - No plain-text password storage

3. **API Security**
   - CSRF protection via Next.js
   - Rate limiting on authentication endpoints
   - Input sanitization and validation

## Error Handling

The system provides detailed error handling for common scenarios:
- Duplicate email addresses
- Invalid role/department selections
- Missing required fields
- Database connection issues
- Authentication failures

## Future Improvements

1. **Password Management**
   - Implement password reset functionality
   - Add password strength requirements
   - Enable 2FA for admin accounts

2. **User Management**
   - Bulk user import/export
   - User activity logging
   - Enhanced filtering and search

3. **Security Enhancements**
   - Session activity monitoring
   - Failed login attempt tracking
   - IP-based access controls
