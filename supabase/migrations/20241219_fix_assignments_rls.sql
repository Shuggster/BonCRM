-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for assignments" ON assignments;
DROP POLICY IF EXISTS "Enable write access for assignments" ON assignments;

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments table
CREATE POLICY "Enable read access for assignments"
ON assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable write access for assignments"
ON assignments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'assignments'; 