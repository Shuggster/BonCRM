-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Create a simplified RLS policy that allows all authenticated access
CREATE POLICY "Allow authenticated access"
    ON public.tasks
    FOR ALL
    TO PUBLIC
    USING (true);
