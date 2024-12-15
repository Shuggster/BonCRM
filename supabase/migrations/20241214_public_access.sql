-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON contacts;
DROP POLICY IF EXISTS "Enable write access for all users" ON contacts;

-- Create new policies for public access
CREATE POLICY "Enable read access for all users" 
ON contacts FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Enable write access for all users" 
ON contacts FOR ALL 
TO anon
USING (true);
