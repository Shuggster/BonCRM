-- Drop and recreate the tasks table
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    task_group_id UUID REFERENCES task_groups(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_groups table first
DROP TABLE IF EXISTS task_groups;

CREATE TABLE task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_activities table for logging changes
DROP TABLE IF EXISTS task_activities;

CREATE TABLE task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) NOT NULL,
    action_type TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_comments table
DROP TABLE IF EXISTS task_comments;

CREATE TABLE task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS task_groups_user_id_idx ON task_groups(user_id);
CREATE INDEX IF NOT EXISTS task_activities_task_id_idx ON task_activities(task_id);
CREATE INDEX IF NOT EXISTS task_comments_task_id_idx ON task_comments(task_id);

-- Grant access
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;
GRANT ALL ON tasks TO anon;

GRANT ALL ON task_groups TO authenticated;
GRANT ALL ON task_groups TO service_role;
GRANT ALL ON task_groups TO anon;

GRANT ALL ON task_activities TO authenticated;
GRANT ALL ON task_activities TO service_role;
GRANT ALL ON task_activities TO anon;

GRANT ALL ON task_comments TO authenticated;
GRANT ALL ON task_comments TO service_role;
GRANT ALL ON task_comments TO anon;

-- Disable RLS for testing
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;

-- Add assignment fields to calendar_events
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add assignment fields to contacts
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add assignment fields to scheduled_activities
ALTER TABLE scheduled_activities
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Update types
CREATE TYPE assignable_type AS ENUM ('user', 'team');

-- Add foreign key constraints
ALTER TABLE calendar_events
ADD CONSTRAINT fk_calendar_events_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE contacts
ADD CONSTRAINT fk_contacts_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE scheduled_activities
ADD CONSTRAINT fk_scheduled_activities_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;
