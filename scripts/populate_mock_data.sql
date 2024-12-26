-- Function to safely delete data from tables if they exist
CREATE OR REPLACE FUNCTION safe_truncate_tables() RETURNS void AS $$
BEGIN
    -- Check and truncate tables in reverse order of dependencies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_tag_relations') THEN
        TRUNCATE TABLE contact_tag_relations CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scheduled_activities') THEN
        TRUNCATE TABLE scheduled_activities CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        TRUNCATE TABLE tasks CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_groups') THEN
        TRUNCATE TABLE task_groups CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_tags') THEN
        TRUNCATE TABLE contact_tags CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts') THEN
        TRUNCATE TABLE contacts CASCADE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the safe truncate function
SELECT safe_truncate_tables();

-- Create temporary table for admin user ID
CREATE TEMPORARY TABLE IF NOT EXISTS temp_user_id (user_id UUID);
DELETE FROM temp_user_id;

-- Store an existing admin user ID
INSERT INTO temp_user_id
SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE LIMIT 1;

-- Verify we have a user ID
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM temp_user_id) THEN
        RAISE EXCEPTION 'No active admin user found in the users table';
    END IF;
END $$;

-- Create contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_tag_relations table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_tag_relations (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (contact_id, tag_id)
);

-- Create task_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    task_group_id UUID REFERENCES task_groups(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS scheduled_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert mock contact tags
INSERT INTO contact_tags (id, name, color, created_at) VALUES
    (gen_random_uuid(), 'VIP', '#FF0000', NOW()),
    (gen_random_uuid(), 'Lead', '#00FF00', NOW()),
    (gen_random_uuid(), 'Customer', '#0000FF', NOW()),
    (gen_random_uuid(), 'Prospect', '#FFA500', NOW()),
    (gen_random_uuid(), 'Partner', '#800080', NOW());

-- Insert mock contacts
INSERT INTO contacts (id, first_name, last_name, email, phone, company, job_title, created_at) VALUES
    (gen_random_uuid(), 'John', 'Smith', 'john.smith@example.com', '+1-555-0101', 'Tech Corp', 'CEO', NOW()),
    (gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.j@example.com', '+1-555-0102', 'Marketing Pro', 'Marketing Director', NOW()),
    (gen_random_uuid(), 'Michael', 'Brown', 'michael.b@example.com', '+1-555-0103', 'Sales Direct', 'Sales Manager', NOW()),
    (gen_random_uuid(), 'Emma', 'Davis', 'emma.d@example.com', '+1-555-0104', 'Design Hub', 'Creative Director', NOW()),
    (gen_random_uuid(), 'James', 'Wilson', 'james.w@example.com', '+1-555-0105', 'Finance Plus', 'CFO', NOW());

-- Link contacts with tags
WITH 
    contact_ids AS (SELECT id FROM contacts),
    tag_ids AS (SELECT id FROM contact_tags)
INSERT INTO contact_tag_relations (contact_id, tag_id, created_at)
SELECT 
    c.id,
    t.id,
    NOW()
FROM 
    contact_ids c
    CROSS JOIN tag_ids t
WHERE random() < 0.3; -- Randomly assign tags to contacts

-- Insert mock task groups using the stored user ID
INSERT INTO task_groups (id, name, color, description, user_id, created_at) 
SELECT
    gen_random_uuid(),
    name,
    color,
    description,
    (SELECT user_id FROM temp_user_id),
    NOW()
FROM (
    VALUES 
        ('Sales Follow-up', '#FF0000', 'Tasks related to sales follow-ups'),
        ('Customer Support', '#00FF00', 'Customer support related tasks'),
        ('Marketing Campaign', '#0000FF', 'Marketing campaign tasks'),
        ('Administrative', '#FFA500', 'Administrative tasks'),
        ('Business Development', '#800080', 'Business development tasks')
) AS t(name, color, description);

-- Insert mock tasks using the stored user ID
INSERT INTO tasks (id, title, description, status, priority, due_date, assigned_to, task_group_id, user_id, created_at)
SELECT
    gen_random_uuid(),
    'Task ' || i,
    'Description for task ' || i,
    (ARRAY['todo', 'in-progress', 'completed'])[floor(random() * 3 + 1)],
    (ARRAY['low', 'medium', 'high'])[floor(random() * 3 + 1)],
    NOW() + (random() * interval '30 days'),
    (SELECT user_id FROM temp_user_id),
    (SELECT id FROM task_groups ORDER BY random() LIMIT 1),
    (SELECT user_id FROM temp_user_id),
    NOW()
FROM generate_series(1, 20) i;

-- Insert mock scheduled activities using the stored user ID
INSERT INTO scheduled_activities (id, contact_id, user_id, title, type, description, scheduled_for, status, created_at)
SELECT
    gen_random_uuid(),
    (SELECT id FROM contacts ORDER BY random() LIMIT 1),
    (SELECT user_id FROM temp_user_id),
    'Activity ' || i,
    (ARRAY['call', 'meeting', 'email', 'follow-up'])[floor(random() * 4 + 1)],
    'Description for activity ' || i,
    NOW() + (random() * interval '30 days'),
    'pending',
    NOW()
FROM generate_series(1, 15) i;

-- Clean up
DROP TABLE IF EXISTS temp_user_id;