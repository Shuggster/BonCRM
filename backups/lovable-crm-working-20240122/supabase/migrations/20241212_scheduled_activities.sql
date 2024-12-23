-- Drop existing if needed
drop table if exists scheduled_activities cascade;
drop type if exists activity_type cascade;
drop type if exists activity_status cascade;

-- Create enums for activities
create type activity_type as enum ('call', 'email', 'meeting', 'follow_up');
create type activity_status as enum ('pending', 'completed', 'cancelled');

-- Create activities table
create table if not exists scheduled_activities (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    contact_id uuid references contacts(id) on delete cascade,
    type activity_type not null,
    title text not null,
    description text,
    scheduled_for timestamp with time zone not null,
    status activity_status default 'pending',
    completed_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table scheduled_activities enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own scheduled activities" on scheduled_activities;
drop policy if exists "Users can insert their own scheduled activities" on scheduled_activities;
drop policy if exists "Users can update their own scheduled activities" on scheduled_activities;
drop policy if exists "Users can delete their own scheduled activities" on scheduled_activities;

-- Create new policies
create policy "Users can view their own scheduled activities"
    on scheduled_activities for select
    using (auth.uid() = user_id);

create policy "Users can insert their own scheduled activities"
    on scheduled_activities for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own scheduled activities"
    on scheduled_activities for update
    using (auth.uid() = user_id);

create policy "Users can delete their own scheduled activities"
    on scheduled_activities for delete
    using (auth.uid() = user_id);

-- Drop trigger if exists
drop trigger if exists update_scheduled_activities_updated_at on scheduled_activities;

-- Create or replace trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger update_scheduled_activities_updated_at
    before update on scheduled_activities
    for each row
    execute function update_updated_at_column();
