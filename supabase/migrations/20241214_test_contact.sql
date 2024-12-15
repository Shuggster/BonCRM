-- Insert a test contact
INSERT INTO contacts (first_name, last_name, email, company)
VALUES ('Test', 'Contact', 'test@example.com', 'Test Company')
RETURNING *;
