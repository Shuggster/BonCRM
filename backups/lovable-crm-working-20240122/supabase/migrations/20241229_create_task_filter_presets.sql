-- Create updated_at function if it doesn't exist
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create task filter presets table
create table if not exists task_filter_presets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table task_filter_presets enable row level security;

create policy "Users can view their own filter presets"
  on task_filter_presets for select
  using (auth.uid() = user_id);

create policy "Users can create their own filter presets"
  on task_filter_presets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own filter presets"
  on task_filter_presets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own filter presets"
  on task_filter_presets for delete
  using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger set_updated_at
  before update on task_filter_presets
  for each row
  execute function set_updated_at(); 