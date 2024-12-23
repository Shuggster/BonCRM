-- Drop the foreign key constraint
ALTER TABLE task_activities DROP CONSTRAINT IF EXISTS task_activities_user_id_fkey;

-- Drop the user_id column
ALTER TABLE task_activities DROP COLUMN IF EXISTS user_id;

-- Drop the index if it exists
DROP INDEX IF EXISTS idx_task_activities_user_id;
