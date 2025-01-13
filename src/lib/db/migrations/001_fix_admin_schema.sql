-- Update user roles enum
ALTER TYPE user_role DROP VALUE IF EXISTS 'user';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operational';

-- Create team_members junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Add RLS policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable by team members and admins"
    ON team_members
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM team_members WHERE team_id = team_members.team_id
            UNION
            SELECT id FROM users WHERE role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert team members"
    ON team_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update team members"
    ON team_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete team members"
    ON team_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Update the teams table to ensure it has all needed columns
ALTER TABLE teams 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); 