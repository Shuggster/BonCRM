-- Add assignment columns to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Notify PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema'; 