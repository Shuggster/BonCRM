-- Create task comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Create task activity logs table
CREATE TABLE IF NOT EXISTS public.task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL, -- 'status_change', 'group_change', 'priority_change', etc.
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated access" ON public.task_comments
    FOR ALL
    TO PUBLIC
    USING (true);

CREATE POLICY "Allow authenticated access" ON public.task_activities
    FOR ALL
    TO PUBLIC
    USING (true);

-- Add updated_at trigger to comments
CREATE TRIGGER handle_task_comments_updated_at
    BEFORE UPDATE ON public.task_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 