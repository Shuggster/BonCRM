-- Drop existing foreign key if it exists
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- Add the correct foreign key constraint
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_to_fkey 
FOREIGN KEY (assigned_to) 
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Create a view to join tasks with user information
CREATE OR REPLACE VIEW public.tasks_with_assignees AS
SELECT 
    t.*,
    u.email as assignee_email,
    u.raw_user_meta_data->>'full_name' as assignee_name
FROM 
    public.tasks t
LEFT JOIN 
    auth.users u ON t.assigned_to = u.id;

-- Grant access to the view
GRANT SELECT ON public.tasks_with_assignees TO authenticated;
