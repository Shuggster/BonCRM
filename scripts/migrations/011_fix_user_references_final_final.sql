-- First drop any existing foreign key constraints
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_assigned_to_fkey;
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS fk_calendar_events_assigned_to;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_assigned_to_fkey;

-- Drop the columns if they exist (to ensure clean recreation)
ALTER TABLE calendar_events DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE contacts DROP COLUMN IF EXISTS assigned_to;

-- Add the columns back with correct references to auth.users
ALTER TABLE calendar_events 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE contacts 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
