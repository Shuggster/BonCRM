-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for contacts" ON contacts;

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated and anonymous users
CREATE POLICY "Enable all access for contacts"
ON contacts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Allow public access to the table
ALTER TABLE contacts FORCE ROW LEVEL SECURITY;

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'contacts';
