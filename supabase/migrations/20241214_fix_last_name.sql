-- Make last_name nullable
ALTER TABLE contacts ALTER COLUMN last_name DROP NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
