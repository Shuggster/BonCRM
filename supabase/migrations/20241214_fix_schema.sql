-- First, let's check the current schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contacts';

-- Then create a fresh contacts table with all needed columns
DROP TABLE IF EXISTS contacts;

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    tags TEXT[],
    UNIQUE(email)
);

-- Enable RLS but allow all operations
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" 
ON contacts FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON contacts FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON contacts FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Insert a test contact to verify
INSERT INTO contacts (first_name, last_name, email, company)
VALUES ('Test', 'User', 'test@example.com', 'Test Company')
RETURNING *;
