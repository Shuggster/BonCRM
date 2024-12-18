-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'tasks';

-- Recreate the insert policy
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
); 