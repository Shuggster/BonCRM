-- Create enums for activities
create type if not exists activity_type as enum ('call', 'email', 'meeting', 'follow_up');
create type if not exists activity_status as enum ('pending', 'completed', 'cancelled');

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

-- Create policies
create policy "Users can view their own scheduled activities"
    on scheduled_activities for select
    using (auth.uid() = user_id);

create policy "Users can manage their own scheduled activities"
    on scheduled_activities for all
    using (auth.uid() = user_id);
