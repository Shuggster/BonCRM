-- Create users table with RLS
create table if not exists users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    password text not null,
    name text,
    role text not null default 'user',
    department text not null default 'general',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- Create policies
create policy "Users can view their own profile"
on users for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile"
on users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Create admin user if it doesn't exist
insert into users (email, password, name, role, department)
select 
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    'Admin User',
    'admin',
    'admin'
where not exists (
    select 1 from users where email = 'admin@example.com'
);

-- Create indexes
create index if not exists users_email_idx on users (email);
create index if not exists users_role_idx on users (role);
create index if not exists users_department_idx on users (department); 