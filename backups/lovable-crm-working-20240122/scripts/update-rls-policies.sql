-- Enable RLS on tasks and related tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all access for public" ON tasks;
DROP POLICY IF EXISTS "Enable all access for public" ON task_groups;
DROP POLICY IF EXISTS "Enable all access for public" ON task_activities;
DROP POLICY IF EXISTS "Enable all access for public" ON task_comments;

-- Create simplified RLS policies that rely on NextAuth as primary security gate
CREATE POLICY "Enable all access for public"
ON tasks
FOR ALL
TO public
USING (true);

CREATE POLICY "Enable all access for public"
ON task_groups
FOR ALL
TO public
USING (true);

CREATE POLICY "Enable all access for public"
ON task_activities
FOR ALL
TO public
USING (true);

CREATE POLICY "Enable all access for public"
ON task_comments
FOR ALL
TO public
USING (true);
