-- Update the first contact with the first available industry
UPDATE contacts
SET industry_id = (SELECT id FROM industries LIMIT 1)
WHERE id = (SELECT id FROM contacts LIMIT 1); 