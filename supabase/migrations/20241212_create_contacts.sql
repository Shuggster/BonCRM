-- Drop existing tables if needed
drop table if exists contacts cascade;

-- Create contacts table
create table if not exists contacts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    first_name text not null,
    last_name text,
    email text,
    phone text,
    company text,
    position text,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table contacts enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own contacts" on contacts;
drop policy if exists "Users can manage their own contacts" on contacts;

-- Create policy for viewing contacts (users can only view their own)
create policy "Users can view their own contacts"
on contacts for select
using (auth.uid() = user_id);

-- Create policy for managing contacts (users can only manage their own)
create policy "Users can manage their own contacts"
on contacts for all
using (auth.uid() = user_id);

-- Create trigger for updating updated_at
create trigger update_contacts_updated_at
    before update on contacts
    for each row
    execute function update_updated_at_column();
