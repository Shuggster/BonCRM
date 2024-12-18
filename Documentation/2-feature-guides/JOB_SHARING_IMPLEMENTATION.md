# Job Sharing Implementation Guide

## Overview
This guide outlines the step-by-step process for implementing job sharing while maintaining our current authentication and security model.

## Prerequisites
- Current authentication system using NextAuth.js
- Existing RLS policies (public access)
- Proper key usage (anon key for client, service role for admin)

## Implementation Steps

### Phase 1: Database Setup
```sql
-- Step 1: Create job sharing tables
CREATE TABLE job_share_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_share_members (
    team_id UUID REFERENCES job_share_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Step 2: Add team reference to existing tables
ALTER TABLE tasks ADD COLUMN team_id UUID REFERENCES job_share_teams(id);
ALTER TABLE contacts ADD COLUMN team_id UUID REFERENCES job_share_teams(id);
```

### Phase 2: Basic RLS Setup
```sql
-- Step 1: Enable RLS on new tables
ALTER TABLE job_share_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_share_members ENABLE ROW LEVEL SECURITY;

-- Step 2: Create initial public policies (temporary)
CREATE POLICY "Enable public access for teams" ON job_share_teams
    FOR ALL USING (true);

CREATE POLICY "Enable public access for members" ON job_share_members
    FOR ALL USING (true);
```

### Phase 3: Testing Basic Setup
1. Create test team
2. Add test members
3. Assign team to task/contact
4. Verify basic operations work

### Phase 4: Implement Proper RLS
```sql
-- Step 1: Remove temporary public policies
DROP POLICY "Enable public access for teams" ON job_share_teams;
DROP POLICY "Enable public access for members" ON job_share_members;

-- Step 2: Add proper team access policies
CREATE POLICY "Team access" ON job_share_teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM job_share_members
            WHERE team_id = job_share_teams.id
            AND user_id = auth.uid()
        )
    );

-- Step 3: Add member access policies
CREATE POLICY "Member access" ON job_share_members
    FOR ALL USING (
        user_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM job_share_members
            WHERE team_id = job_share_members.team_id
            AND user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Step 4: Update task and contact policies
CREATE POLICY "Team-based access for tasks" ON tasks
    FOR ALL USING (
        team_id IS NULL 
        OR 
        EXISTS (
            SELECT 1 FROM job_share_members
            WHERE team_id = tasks.team_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team-based access for contacts" ON contacts
    FOR ALL USING (
        team_id IS NULL 
        OR 
        EXISTS (
            SELECT 1 FROM job_share_members
            WHERE team_id = contacts.team_id
            AND user_id = auth.uid()
        )
    );
```

### Phase 5: API Implementation
1. Create team management endpoints:
```typescript
// src/app/api/teams/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { name } = await req.json();
    
    const { data: team, error } = await supabase
        .from('job_share_teams')
        .insert({ name })
        .select()
        .single();
        
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ team });
}
```

### Phase 6: Testing Steps
1. Test Team Creation
   - Create new team
   - Verify RLS policies
   - Check team visibility

2. Test Member Management
   - Add members to team
   - Test different roles
   - Verify access controls

3. Test Task/Contact Assignment
   - Assign items to team
   - Verify visibility rules
   - Test non-team member access

### Rollback Plan
```sql
-- 1. Remove policies
DROP POLICY IF EXISTS "Team access" ON job_share_teams;
DROP POLICY IF EXISTS "Member access" ON job_share_members;
DROP POLICY IF EXISTS "Team-based access for tasks" ON tasks;
DROP POLICY IF EXISTS "Team-based access for contacts" ON contacts;

-- 2. Remove columns
ALTER TABLE tasks DROP COLUMN IF EXISTS team_id;
ALTER TABLE contacts DROP COLUMN IF EXISTS team_id;

-- 3. Drop tables
DROP TABLE IF EXISTS job_share_members;
DROP TABLE IF EXISTS job_share_teams;

-- 4. Restore original policies
CREATE POLICY "Enable public access" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable public access" ON contacts FOR ALL USING (true);
```

## Implementation Order
1. Run Phase 1 SQL and verify tables
2. Run Phase 2 SQL and test basic access
3. Implement Phase 3 testing
4. Only proceed to Phase 4 after confirmation
5. Implement API endpoints one at a time
6. Run full test suite before completion

## Security Considerations
1. Never bypass RLS policies
2. Use anon key for client operations
3. Test all policies in isolation
4. Maintain existing auth flow
5. Document all policy changes

## Required Testing
Before each phase:
- [ ] Backup database
- [ ] Test in isolation
- [ ] Verify existing features
- [ ] Check auth still works
- [ ] Document changes
