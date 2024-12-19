-- Disable RLS to match original working state
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;

-- Grant access to match original setup
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON tasks TO service_role;
GRANT ALL ON tasks TO anon;

GRANT ALL ON task_groups TO authenticated;
GRANT ALL ON task_groups TO service_role;
GRANT ALL ON task_groups TO anon;

GRANT ALL ON task_activities TO authenticated;
GRANT ALL ON task_activities TO service_role;
GRANT ALL ON task_activities TO anon;

GRANT ALL ON task_comments TO authenticated;
GRANT ALL ON task_comments TO service_role;
GRANT ALL ON task_comments TO anon;
