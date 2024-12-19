-- Drop and recreate the users table
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

-- Grant access to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;
GRANT ALL ON users TO anon;

-- Create index
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
