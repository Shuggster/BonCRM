-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS contact_notes CASCADE;

CREATE TABLE contact_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid -- Default UUID for anonymous users
);

-- Enable RLS
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Enable all access for contact_notes" ON contact_notes
FOR ALL
TO public
USING (true)
WITH CHECK (true);
