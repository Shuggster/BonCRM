-- Insert a contact with a valid industry_id
INSERT INTO contacts (
    first_name,
    email,
    company,
    industry_id
) VALUES (
    'Test',
    'test@example.com',
    'Test Company',
    'ec3ef12c-04ac-48ff-9d86-2678618e8872'  -- This is the Technology industry ID from your data
) RETURNING *;
