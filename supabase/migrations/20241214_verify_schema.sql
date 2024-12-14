-- Check if job_title exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- Recreate the job_title column if needed
ALTER TABLE contacts DROP COLUMN IF EXISTS job_title;
ALTER TABLE contacts ADD COLUMN job_title TEXT;

-- Verify again
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
