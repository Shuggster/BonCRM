-- Make user_id nullable in tasks table
ALTER TABLE tasks ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in task_groups table
ALTER TABLE task_groups ALTER COLUMN user_id DROP NOT NULL;

-- If we need to restore:
-- ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE task_groups ALTER COLUMN user_id SET NOT NULL;
