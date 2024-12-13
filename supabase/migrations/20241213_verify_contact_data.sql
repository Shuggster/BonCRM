-- Verify and fix any contacts with missing or incorrect data
UPDATE contacts
SET first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- Add a trigger to ensure first_name is never null
CREATE OR REPLACE FUNCTION ensure_contact_names()
RETURNS TRIGGER AS $$
BEGIN
    NEW.first_name = COALESCE(NEW.first_name, '');
    NEW.last_name = COALESCE(NEW.last_name, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_contact_names_trigger ON contacts;
CREATE TRIGGER ensure_contact_names_trigger
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION ensure_contact_names();
