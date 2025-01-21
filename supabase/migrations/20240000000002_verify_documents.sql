-- Verify documents table exists and has correct structure
create table if not exists documents (
    id uuid default gen_random_uuid() primary key,
    title text,
    content text,
    metadata jsonb default '{}'::jsonb,
    user_id uuid references auth.users(id),
    department text,
    file_name text,
    file_path text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create index for text search
create index if not exists idx_documents_content on documents using gin(to_tsvector('english', content));
create index if not exists idx_documents_title on documents using gin(to_tsvector('english', title));

-- Enable RLS but allow all access for testing
alter table documents enable row level security;
create policy "Allow all access to documents"
    on documents for all
    using (true)
    with check (true); 