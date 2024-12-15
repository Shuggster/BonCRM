-- First check the current schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contact_notes';

-- Drop and recreate the contact_notes table without user_id requirement
DROP TABLE IF EXISTS contact_notes;

CREATE TABLE contact_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    user_id UUID -- Make user_id optional
);

-- Enable RLS
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Enable all access for contact_notes" ON contact_notes
FOR ALL
TO public
USING (true)
WITH CHECK (true);
