-- Update Hugh Rogers' contact with an industry
UPDATE contacts 
SET industry_id = (SELECT id FROM industries WHERE name = 'Technology' LIMIT 1)
WHERE id = '6ce783aa-e4f9-4cb1-90a0-19dcc3056115'; 