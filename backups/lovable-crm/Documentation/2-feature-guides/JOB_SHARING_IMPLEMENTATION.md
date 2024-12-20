# Job Sharing Implementation Guide

## Overview
This guide outlines the implementation plan for job sharing functionality, integrated with our NextAuth.js authentication system and department-based access control.

## Current Architecture
- NextAuth.js for authentication
- Supabase for data storage
- Role and department-based access control
- Protected API routes

## Database Schema

### User Management (Existing)
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

### Job Sharing Tables
```sql
-- Job Share Pairs
CREATE TABLE public.job_share_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user1_id, user2_id)
);

-- Job Share Activity Log
CREATE TABLE public.job_share_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_pair_id UUID REFERENCES job_share_pairs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);
```

## API Implementation

### 1. Job Share Creation
```typescript
// POST /api/job-shares
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { user1Id, user2Id, department } = await req.json()
    
    // Validate users are in same department
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, role, department')
      .in('id', [user1Id, user2Id])

    if (userError || users.length !== 2) {
      return NextResponse.json({ error: 'Invalid users' }, { status: 400 })
    }

    // Validate both users are operational and in same department
    if (!users.every(u => u.role === 'operational' && u.department === department)) {
      return NextResponse.json({ 
        error: 'Users must be operational and in same department' 
      }, { status: 400 })
    }

    // Create job share pair
    const { data, error } = await supabase
      .from('job_share_pairs')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        department,
        status: 'pending',
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating job share:', error)
    return NextResponse.json({ error: 'Failed to create job share' }, { status: 500 })
  }
}
```

### 2. Job Share Management
```typescript
// PATCH /api/job-shares/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { status, notes } = await req.json()
    
    const { data, error } = await supabase
      .from('job_share_pairs')
      .update({
        status,
        notes,
        approved_by: status === 'active' ? session.user.id : null,
        approved_at: status === 'active' ? new Date().toISOString() : null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log the activity
    await supabase.from('job_share_activity').insert({
      share_pair_id: params.id,
      action: `Status changed to ${status}`,
      performed_by: session.user.id,
      details: { notes }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating job share:', error)
    return NextResponse.json({ error: 'Failed to update job share' }, { status: 500 })
  }
}
```

## Frontend Implementation

### 1. Job Share Request Form
```typescript
interface JobShareRequestForm {
  user1Id: string
  user2Id: string
  department: string
  notes?: string
}

async function createJobShare(data: JobShareRequestForm) {
  const response = await fetch('/api/job-shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create job share')
  }

  return response.json()
}
```

### 2. Manager Approval Interface
```typescript
async function approveJobShare(id: string, status: 'active' | 'suspended' | 'terminated', notes?: string) {
  const response = await fetch(`/api/job-shares/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update job share')
  }

  return response.json()
}
```

## Implementation Rules

### 1. Job Share Creation
- Only operational users can be in job shares
- Users must be in the same department
- Users can only be in one active job share
- Manager approval required for activation

### 2. Access Control
- Managers can approve/reject job shares
- Users can view their own job shares
- Admin can view all job shares
- Department-based visibility

### 3. Status Management
- pending: Initial state
- active: Approved by manager
- suspended: Temporarily disabled
- terminated: Permanently ended

## Future Enhancements

### Phase 1: Core Features
1. Job share request workflow
2. Manager approval process
3. Activity logging
4. Basic reporting

### Phase 2: Advanced Features
1. Calendar integration
2. Task assignment rules
3. Performance metrics
4. Automated notifications

### Phase 3: Monitoring
1. Usage analytics
2. Audit trails
3. Compliance reporting
4. Performance impact tracking
