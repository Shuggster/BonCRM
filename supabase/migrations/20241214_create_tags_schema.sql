-- Drop existing tables if they exist
DROP TABLE IF EXISTS contact_tag_relations CASCADE;
DROP TABLE IF EXISTS contact_tags CASCADE;

-- Create contact_tags table
CREATE TABLE contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_tag_relations table
CREATE TABLE contact_tag_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contact_id, tag_id)
);

-- Enable RLS
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tag_relations ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_tags
CREATE POLICY "Enable read access for all users" ON contact_tags
FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users" ON contact_tags
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON contact_tags
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Create policies for contact_tag_relations
CREATE POLICY "Enable read access for all users" ON contact_tag_relations
FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for authenticated users" ON contact_tag_relations
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON contact_tag_relations
FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_contact_tag_relations_contact_id ON contact_tag_relations(contact_id);
CREATE INDEX idx_contact_tag_relations_tag_id ON contact_tag_relations(tag_id);
CREATE INDEX idx_contact_tags_name ON contact_tags(tag_name);
