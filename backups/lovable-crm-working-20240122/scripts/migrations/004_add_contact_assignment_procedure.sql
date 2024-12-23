-- Create the stored procedure for adding assignment fields
CREATE OR REPLACE FUNCTION add_contact_assignment_fields()
RETURNS void AS $$
BEGIN
    -- Add assignment fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'assigned_to') THEN
        ALTER TABLE contacts 
        ADD COLUMN assigned_to UUID REFERENCES public.users(id),
        ADD COLUMN assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
        ADD COLUMN department TEXT CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop'));
    END IF;
END;
$$ LANGUAGE plpgsql; 

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on tag name
ALTER TABLE tags ADD CONSTRAINT tags_name_unique UNIQUE (name);

-- Add tags array column to contacts if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags UUID[] DEFAULT '{}';

-- Create some default tags
INSERT INTO tags (name, color) VALUES
    ('Lead', '#10B981'),
    ('Partner', '#6366F1'),
    ('New Customer', '#EC4899'),
    ('management', '#3B82F6'),
    ('developer', '#8B5CF6'),
    ('designer', '#F59E0B'),
    ('creative', '#EC4899'),
    ('engineering', '#10B981')
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tags
DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();