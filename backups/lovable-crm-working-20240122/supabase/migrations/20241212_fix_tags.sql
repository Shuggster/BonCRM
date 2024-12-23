-- Drop existing tables
drop table if exists contact_tags cascade;

-- Create tags table
create table if not exists tags (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    color text default '#3B82F6',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(name)
);

-- Create contact_tag_relations junction table
create table if not exists contact_tag_relations (
    id uuid default gen_random_uuid() primary key,
    contact_id uuid references contacts(id) on delete cascade not null,
    tag_id uuid references tags(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(contact_id, tag_id)
);

-- Enable RLS
alter table tags enable row level security;
alter table contact_tag_relations enable row level security;

-- Create policies for tags
create policy "Users can view tags"
on tags for select
using (auth.role() = 'authenticated');

create policy "Users can manage tags"
on tags for all
using (auth.role() = 'authenticated');

-- Create policies for contact_tag_relations
create policy "Users can view their contact tag relations"
on contact_tag_relations for select
using (
    auth.uid() = (
        select user_id 
        from contacts 
        where id = contact_tag_relations.contact_id
    )
);

create policy "Users can manage their contact tag relations"
on contact_tag_relations for all
using (
    auth.uid() = (
        select user_id 
        from contacts 
        where id = contact_tag_relations.contact_id
    )
);

-- Create triggers for updating updated_at
create trigger update_tags_updated_at
    before update on tags
    for each row
    execute function update_updated_at_column();
