-- Drop the incorrect foreign key constraints
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_assigned_to_fkey;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_assigned_to_fkey;

-- Add correct foreign key constraints referencing users table
ALTER TABLE calendar_events
ADD CONSTRAINT calendar_events_assigned_to_fkey
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE contacts
ADD CONSTRAINT contacts_assigned_to_fkey
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;
