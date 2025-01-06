-- Drop existing policies if any exist
DROP POLICY IF EXISTS "Enable read access for own events" ON calendar_events;
DROP POLICY IF EXISTS "Enable insert access for own events" ON calendar_events;
DROP POLICY IF EXISTS "Enable update access for own events" ON calendar_events;
DROP POLICY IF EXISTS "Enable delete access for own events" ON calendar_events;

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for own events"
ON calendar_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for own events"
ON calendar_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own events"
ON calendar_events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own events"
ON calendar_events FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
