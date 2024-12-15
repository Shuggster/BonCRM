# Database Schema Documentation

## Overview
The Lovable CRM database is built on Supabase with Row Level Security (RLS) policies for data protection.

## Core Tables

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    password_hash TEXT NOT NULL
);
```

### Contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    industry_id UUID REFERENCES industries(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES users(id)
);
```

### Industries
```sql
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Tags
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Contact Tags
```sql
CREATE TABLE contact_tags (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (contact_id, tag_id)
);
```

### Scheduled Activities
```sql
CREATE TABLE scheduled_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## RLS Policies

### Users Table
```sql
-- Users can read their own data
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Only admins can create/update users
CREATE POLICY "Admins manage users"
    ON users
    FOR ALL
    USING (auth.jwt()->>'role' = 'admin');
```

### Contacts Table
```sql
-- Users can read contacts they created
CREATE POLICY "Users can read own contacts"
    ON contacts
    FOR SELECT
    USING (auth.uid() = created_by);

-- Department managers can read all contacts in their department
CREATE POLICY "Managers read department contacts"
    ON contacts
    FOR SELECT
    USING (
        auth.jwt()->>'role' = 'department_manager'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = contacts.created_by
            AND users.department = current_user_department()
        )
    );
```

## Triggers

### Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all tables with updated_at
CREATE TRIGGER update_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

## Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Contacts
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_industry ON contacts(industry_id);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);

-- Tags
CREATE INDEX idx_tags_name ON tags(name);
```

## Notes
- All tables include created_at and updated_at timestamps
- UUID used for all primary keys
- Foreign key constraints with CASCADE delete where appropriate
- RLS policies implement role-based access control
- Indexes on frequently queried columns
