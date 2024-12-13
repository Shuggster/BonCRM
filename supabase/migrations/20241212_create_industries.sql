-- Drop existing tables if needed
drop table if exists contact_industries cascade;
drop table if exists industries cascade;

-- Create industries table
create table if not exists industries (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create junction table for contacts and industries
create table if not exists contact_industries (
    contact_id uuid references contacts(id) on delete cascade,
    industry_id uuid references industries(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (contact_id, industry_id)
);

-- Enable RLS
alter table industries enable row level security;
alter table contact_industries enable row level security;

-- Create policies for industries
create policy "Anyone can view industries"
on industries for select
using (true);

create policy "Authenticated users can manage industries"
on industries for all
using (auth.role() = 'authenticated');

-- Create policies for contact_industries
create policy "Users can view their contact industries"
on contact_industries for select
using (
    auth.uid() = (
        select user_id
        from contacts
        where id = contact_industries.contact_id
    )
);

create policy "Users can manage their contact industries"
on contact_industries for all
using (
    auth.uid() = (
        select user_id
        from contacts
        where id = contact_industries.contact_id
    )
);

-- Create triggers for updating updated_at
create trigger update_industries_updated_at
    before update on industries
    for each row
    execute function update_updated_at_column();

-- Insert some default industries
insert into industries (name) values
    ('Technology'),
    ('Healthcare'),
    ('Finance'),
    ('Education'),
    ('Manufacturing'),
    ('Retail'),
    ('Real Estate'),
    ('Entertainment'),
    ('Transportation'),
    ('Energy')
on conflict (name) do nothing;
