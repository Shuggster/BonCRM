-- Add generated name column to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS name text GENERATED ALWAYS AS (
    CASE 
        WHEN last_name IS NOT NULL THEN first_name || ' ' || last_name
        ELSE first_name
    END
) STORED;
