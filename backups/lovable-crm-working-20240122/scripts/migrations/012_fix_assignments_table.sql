-- First create the assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignable_id uuid NOT NULL,
    assignable_type text NOT NULL,
    assigned_to uuid NOT NULL,
    assigned_to_type text NOT NULL CHECK (assigned_to_type IN ('user', 'team')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(assignable_id, assignable_type, assigned_to, assigned_to_type)
);

-- Drop the incorrect foreign key constraints and columns
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_assigned_to_fkey;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_assigned_to_fkey;

ALTER TABLE calendar_events DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE calendar_events DROP COLUMN IF EXISTS assigned_to_type;

ALTER TABLE contacts DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE contacts DROP COLUMN IF EXISTS assigned_to_type;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_assignable ON assignments(assignable_id, assignable_type);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned ON assignments(assigned_to, assigned_to_type);
