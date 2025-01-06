-- Up Migration
-- Create task-event relationship table
CREATE TABLE IF NOT EXISTS task_calendar_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('deadline', 'working_session', 'review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(task_id, event_id)
);

-- Add tracking fields to tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS last_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS schedule_status TEXT CHECK (schedule_status IN ('unscheduled', 'partially_scheduled', 'fully_scheduled'));

-- Add task reference to calendar_events
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_calendar_relations_task_id ON task_calendar_relations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_calendar_relations_event_id ON task_calendar_relations(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_task_id ON calendar_events(related_task_id);

-- Add RLS policies for task_calendar_relations
ALTER TABLE task_calendar_relations ENABLE ROW LEVEL SECURITY;

-- Allow users to read relations they have access to (either task or event)
CREATE POLICY "Enable read access for related users"
ON task_calendar_relations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tasks WHERE id = task_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    ) OR 
    EXISTS (
        SELECT 1 FROM calendar_events WHERE id = event_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    )
);

-- Allow users to create relations for their tasks/events
CREATE POLICY "Enable insert access for task owners"
ON task_calendar_relations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM tasks WHERE id = task_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    ) AND 
    EXISTS (
        SELECT 1 FROM calendar_events WHERE id = event_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    )
);

-- Allow users to delete relations for their tasks/events
CREATE POLICY "Enable delete access for task owners"
ON task_calendar_relations FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM tasks WHERE id = task_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    ) OR 
    EXISTS (
        SELECT 1 FROM calendar_events WHERE id = event_id 
        AND (user_id = auth.uid() OR assigned_to = auth.uid())
    )
);

-- Disable RLS for task_calendar_relations table
ALTER TABLE task_calendar_relations DISABLE ROW LEVEL SECURITY;

-- Disable RLS for calendar_events table if not already disabled
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;

-- Disable RLS for task_activities table if not already disabled
ALTER TABLE task_activities DISABLE ROW LEVEL SECURITY;

-- Down Migration
-- Drop RLS policies
DROP POLICY IF EXISTS "Enable read access for related users" ON task_calendar_relations;
DROP POLICY IF EXISTS "Enable insert access for task owners" ON task_calendar_relations;
DROP POLICY IF EXISTS "Enable delete access for task owners" ON task_calendar_relations;

-- Drop indexes
DROP INDEX IF EXISTS idx_task_calendar_relations_task_id;
DROP INDEX IF EXISTS idx_task_calendar_relations_event_id;
DROP INDEX IF EXISTS idx_calendar_events_related_task_id;

-- Remove columns from calendar_events
ALTER TABLE calendar_events DROP COLUMN IF EXISTS related_task_id;

-- Remove columns from tasks
ALTER TABLE tasks DROP COLUMN IF EXISTS schedule_status;
ALTER TABLE tasks DROP COLUMN IF EXISTS last_scheduled_at;

-- Drop relationship table
DROP TABLE IF EXISTS task_calendar_relations; 