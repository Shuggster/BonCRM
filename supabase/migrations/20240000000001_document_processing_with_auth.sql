-- Documents table with RLS
create table if not exists documents (
    id uuid default gen_random_uuid() primary key,
    filename text not null,
    summary text,
    metadata jsonb,
    total_chunks integer not null,
    department text not null references public.users(department),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Document chunks table with RLS
create table if not exists document_chunks (
    id uuid default gen_random_uuid() primary key,
    document_id uuid references documents(id) on delete cascade,
    content text not null,
    chunk_index integer not null,
    department text not null references public.users(department),
    created_at timestamp with time zone default now()
);

-- Audit logs table
create table if not exists audit_logs (
    id uuid default gen_random_uuid() primary key,
    action text not null,
    user_id uuid references public.users(id),
    details jsonb,
    created_at timestamp with time zone default now()
);

-- Create index for full text search
create index if not exists idx_document_chunks_content on document_chunks using gin(to_tsvector('english', content));

-- Enable Row Level Security
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table audit_logs enable row level security;

-- Documents policies
create policy "Users can view documents in their department"
on documents for select
to authenticated
using (
    department = (
        select department 
        from users 
        where id = auth.uid()
    )
);

create policy "Managers and admins can insert documents for their department"
on documents for insert
to authenticated
with check (
    department = (
        select department 
        from users 
        where id = auth.uid()
    ) and (
        select role 
        from users 
        where id = auth.uid()
    ) in ('admin', 'manager')
);

-- Document chunks policies
create policy "Users can view document chunks in their department"
on document_chunks for select
to authenticated
using (
    department = (
        select department 
        from users 
        where id = auth.uid()
    )
);

create policy "Managers and admins can insert document chunks for their department"
on document_chunks for insert
to authenticated
with check (
    department = (
        select department 
        from users 
        where id = auth.uid()
    ) and (
        select role 
        from users 
        where id = auth.uid()
    ) in ('admin', 'manager')
);

-- Audit logs policies
create policy "Admins can view all audit logs"
on audit_logs for select
to authenticated
using (
    (
        select role 
        from users 
        where id = auth.uid()
    ) = 'admin'
);

create policy "Users can insert audit logs"
on audit_logs for insert
to authenticated
with check (true); 