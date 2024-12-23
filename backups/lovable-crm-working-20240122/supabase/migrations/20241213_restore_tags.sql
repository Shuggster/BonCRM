-- Drop existing tables if they exist
drop table if exists contact_tag_relations cascade;
drop table if exists contact_tags cascade;

-- Create contact_tags table
create table if not exists contact_tags (
    id uuid default gen_random_uuid() primary key,
    contact_id uuid references contacts(id) on delete cascade not null,
    name text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(contact_id, name)
);

-- Enable RLS
alter table contact_tags enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view contact tags" on contact_tags;
drop policy if exists "Users can manage their contact tags" on contact_tags;

-- Create policy for viewing contact tags (any authenticated user can view)
create policy "Users can view contact tags"
on contact_tags for select
using (auth.role() = 'authenticated');

-- Create policy for managing contact tags (users can only manage their own contacts' tags)
create policy "Users can manage their contact tags"
on contact_tags for all
using (
    auth.uid() = (
        select user_id 
        from contacts 
        where id = contact_tags.contact_id
    )
);

-- Create trigger for updating updated_at
create trigger update_contact_tags_updated_at
    before update on contact_tags
    for each row
    execute function update_updated_at_column();
