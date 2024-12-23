-- Create task_groups table
CREATE TABLE IF NOT EXISTS public.task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(name, user_id)
);

-- Add group_id to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.task_groups(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for task_groups
CREATE POLICY "Users can view their own task groups"
    ON public.task_groups
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task groups"
    ON public.task_groups
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task groups"
    ON public.task_groups
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task groups"
    ON public.task_groups
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_task_groups_updated_at
    BEFORE UPDATE ON public.task_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  