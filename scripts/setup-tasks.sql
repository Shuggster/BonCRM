-- Add department column to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add assignment fields to scheduled_activities
ALTER TABLE scheduled_activities
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;
