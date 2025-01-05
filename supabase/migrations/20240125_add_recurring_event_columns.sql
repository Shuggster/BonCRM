-- Add columns for recurring events
ALTER TABLE scheduled_activities 
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS recurrence JSONB,
  ADD COLUMN IF NOT EXISTS original_event_id UUID REFERENCES scheduled_activities(id),
  ADD COLUMN IF NOT EXISTS instance_date TIMESTAMPTZ;

-- Create index for recurring event lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_original_event_id 
  ON scheduled_activities(original_event_id);

-- Add check constraint for duration
ALTER TABLE scheduled_activities 
  ADD CONSTRAINT duration_minutes_positive CHECK (duration_minutes > 0); 