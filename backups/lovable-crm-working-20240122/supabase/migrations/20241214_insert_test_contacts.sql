-- Insert test contacts without industry dependency
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
    tags
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
    ARRAY['developer', 'engineering']
),
(
    'Jane',
    'Smith',
    'jane.smith@example.com',
    '+0987654321',
    'Design Co',
    'UI Designer',
    '456 Design Ave',
    'New York',
    'USA',
    'www.designco.com',
    ARRAY['designer', 'creative']
);
