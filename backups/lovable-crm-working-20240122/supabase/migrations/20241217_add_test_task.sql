-- Insert a test task
INSERT INTO public.tasks (
    title,
    description,
    status,
    priority,
    due_date,
    user_id
)
SELECT 
    'Welcome to your Task Manager',
    'This is a sample task to get you started. Feel free to edit or delete it!',
    'todo',
    'medium',
    timezone('utc', now()) + interval '7 days',
    auth.uid()
WHERE 
    auth.uid() IS NOT NULL;
