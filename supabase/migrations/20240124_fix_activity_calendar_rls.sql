-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own activity calendar relations" ON activity_calendar_relations;
DROP POLICY IF EXISTS "Users can manage their own activity calendar relations" ON activity_calendar_relations;

-- Disable RLS for activity_calendar_relations table
ALTER TABLE activity_calendar_relations DISABLE ROW LEVEL SECURITY; 