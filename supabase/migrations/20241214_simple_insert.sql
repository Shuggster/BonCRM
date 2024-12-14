-- Try a simple insert with just required fields
INSERT INTO contacts (
    first_name,
    email,
    company
) VALUES (
    'Test',
    'test@example.com',
    'Test Company'
) RETURNING *;
