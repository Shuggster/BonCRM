-- Create task groups table
CREATE TABLE IF NOT EXISTS public.task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Add task_group_id to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS task_group_id UUID REFERENCES public.task_groups(id);

-- Create RLS policies for task_groups
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access (matching our tasks table policy)
CREATE POLICY "Allow authenticated access"
    ON public.task_groups
    FOR ALL
    TO PUBLIC
    USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to task_groups
CREATE TRIGGER handle_task_groups_updated_at
    BEFORE UPDATE ON public.task_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();