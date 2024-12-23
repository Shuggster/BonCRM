-- Drop existing policies if they exist
drop policy if exists "Users can view contact tags" on contact_tags;
drop policy if exists "Users can manage their contact tags" on contact_tags;

-- Enable RLS on contact_tags table
alter table contact_tags enable row level security;

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
