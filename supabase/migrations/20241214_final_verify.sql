-- Verify contacts with industries
SELECT 
    c.first_name,
    c.last_name,
    c.email,
    c.company,
    c.tags,
    i.name as industry_name
FROM contacts c
LEFT JOIN industries i ON c.industry_id = i.id;
