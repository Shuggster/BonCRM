-- Drop constraints from contacts table
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_department_check;

-- Drop constraints from calendar_events table if they exist
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_department_check;

-- Drop constraints from users table if they exist
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_check;

-- Make all department columns TEXT type
ALTER TABLE contacts ALTER COLUMN department TYPE TEXT;
ALTER TABLE calendar_events ALTER COLUMN department TYPE TEXT;
ALTER TABLE users ALTER COLUMN department TYPE TEXT;

-- Drop the department_type enum if it exists
DROP TYPE IF EXISTS department_type;
