-- Verify contacts with their industries
SELECT 
    c.first_name,
    c.last_name,
    c.email,
    c.company,
    i.name as industry,
    c.tags
FROM contacts c
LEFT JOIN industries i ON c.industry_id = i.id;
