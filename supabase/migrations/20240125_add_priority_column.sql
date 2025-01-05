-- Create priority type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE activity_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add priority column to scheduled_activities if it doesn't exist
ALTER TABLE scheduled_activities 
  ADD COLUMN IF NOT EXISTS priority activity_priority;

-- Create index for priority lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_priority 
  ON scheduled_activities(priority); 