-- First, drop and recreate the users table
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test user with a known password hash (test123)
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@test.com',
    '$2b$10$EiJ/PVP1Zy/0Y7RqP1DOz.fOQOXINpjUjxHD8hNqZ9eJ6YuiGvxUK',
    'Admin User',
    'admin'
);

-- Verify the user was created
SELECT * FROM users WHERE email = 'admin@test.com';
