-- Add color column if it doesn't exist
ALTER TABLE contact_tags
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6';
