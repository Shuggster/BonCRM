-- Insert test user with bcrypt hashed password (test123)
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@test.com',
    '$2b$10$EiJ/PVP1Zy/0Y7RqP1DOz.fOQOXINpjUjxHD8hNqZ9eJ6YuiGvxUK',
    'Admin User',
    'admin'
)
RETURNING *;
