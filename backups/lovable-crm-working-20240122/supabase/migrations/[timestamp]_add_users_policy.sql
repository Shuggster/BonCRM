-- Allow authenticated users to read other users' basic info
CREATE POLICY "Allow authenticated access to users"
ON users
FOR SELECT
TO authenticated
USING (true); 