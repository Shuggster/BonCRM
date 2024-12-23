-- Drop the old contact_tags table
DROP TABLE IF EXISTS contact_tags CASCADE;

-- Create a temporary function to check if a string is a valid UUID
CREATE OR REPLACE FUNCTION is_uuid(str text)
RETURNS boolean AS $$
BEGIN
  RETURN str ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Clean up any invalid tag references in contacts
UPDATE contacts 
SET tags = ARRAY(
  SELECT DISTINCT unnest(tags) tag_id
  FROM contacts, unnest(tags) tag_id
  WHERE is_uuid(tag_id::text) AND EXISTS (
    SELECT 1 
    FROM tags 
    WHERE id = tag_id::uuid
  )
)
WHERE tags IS NOT NULL;

-- Drop the temporary function
DROP FUNCTION IF EXISTS is_uuid(text);