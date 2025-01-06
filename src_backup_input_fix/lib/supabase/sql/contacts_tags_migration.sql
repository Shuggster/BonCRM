-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#000000',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contacts_tags junction table
CREATE TABLE IF NOT EXISTS public.contacts_tags (
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (contact_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_tags_contact_id ON public.contacts_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags_tag_id ON public.contacts_tags(tag_id);

-- Disable RLS for now (we'll add proper policies later)
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_tags DISABLE ROW LEVEL SECURITY;

-- Add tags column to contacts if it doesn't exist
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tags UUID[] DEFAULT '{}'::UUID[];

-- Create function to automatically update the tags array
CREATE OR REPLACE FUNCTION update_contact_tags()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE contacts 
        SET tags = array_append(tags, NEW.tag_id)
        WHERE id = NEW.contact_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contacts 
        SET tags = array_remove(tags, OLD.tag_id)
        WHERE id = OLD.contact_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain the tags array
CREATE TRIGGER contact_tags_trigger
AFTER INSERT OR DELETE ON contacts_tags
FOR EACH ROW
EXECUTE FUNCTION update_contact_tags(); 