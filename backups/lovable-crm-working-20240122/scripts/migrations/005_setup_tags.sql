-- Drop existing tags table if it exists
DROP TABLE IF EXISTS tags CASCADE;

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on tag name
ALTER TABLE tags ADD CONSTRAINT tags_name_unique UNIQUE (name);

-- Ensure contacts table has tags column
ALTER TABLE contacts DROP COLUMN IF EXISTS tags;
ALTER TABLE contacts ADD COLUMN tags UUID[] DEFAULT '{}';

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

-- Create stored procedure for creating tags
CREATE OR REPLACE FUNCTION create_tags_table()
RETURNS void AS $$
BEGIN
    -- Insert default tags
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
END;
$$ LANGUAGE plpgsql; 