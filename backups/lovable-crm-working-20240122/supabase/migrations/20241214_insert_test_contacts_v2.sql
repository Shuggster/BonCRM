-- Insert test contacts with valid industry IDs
INSERT INTO contacts (
    first_name,
    last_name,
    email,
    phone,
    company,
    job_title,
    address_line1,
    city,
    country,
    website,
    tags,
    industry_id
) VALUES 
(
    'John',
    'Doe',
    'john.doe@example.com',
    '+1234567890',
    'Tech Corp',
    'Software Engineer',
    '123 Main St',
    'San Francisco',
    'USA',
    'www.techcorp.com',
    ARRAY['developer', 'engineering'],
    'ec3ef12c-04ac-48ff-9d86-2678618e8872'  -- Technology
),
(
    'Jane',
    'Smith',
    'jane.smith@example.com',
    '+0987654321',
    'Healthcare Plus',
    'Medical Director',
    '456 Health Ave',
    'Boston',
    'USA',
    'www.healthcareplus.com',
    ARRAY['healthcare', 'management'],
    'fd392233-2378-4bb6-b6a3-73e16bafb47c'  -- Healthcare
);
