-- Insert a test contact (will only work if you're logged in as it requires auth.uid())
INSERT INTO contacts (
    user_id,
    first_name,
    last_name,
    email,
    company
)
VALUES (
    auth.uid(),  -- This will use the currently logged in user's ID
    'John',
    'Doe',
    'john.doe@example.com',
    'Test Company'
);
