-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Create the single working policy
CREATE POLICY "Authenticated users"
ON public.tasks
TO public
USING (true); 