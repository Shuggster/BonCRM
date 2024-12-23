-- Create task_filter_presets table
create table if not exists public.task_filter_presets (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    filters jsonb not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.task_filter_presets enable row level security;

create policy "Users can view their own filter presets"
    on public.task_filter_presets for select
    using (auth.uid() = user_id);

create policy "Users can insert their own filter presets"
    on public.task_filter_presets for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own filter presets"
    on public.task_filter_presets for update
    using (auth.uid() = user_id);

create policy "Users can delete their own filter presets"
    on public.task_filter_presets for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger handle_updated_at before update on public.task_filter_presets
    for each row execute procedure moddatetime('updated_at');
