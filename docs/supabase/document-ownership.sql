-- Add ownership columns to documents table
alter table documents 
    add column user_id text references users(id),
    add column team_id text references teams(id),
    add column is_private boolean default true;

-- Add ownership columns to document_chunks table
alter table document_chunks
    add column user_id text references users(id),
    add column team_id text references teams(id);

-- Drop existing RLS policies
drop policy if exists "Allow full access to authenticated users" on documents;
drop policy if exists "Allow full access to authenticated users" on document_chunks;

-- Documents RLS policies
create policy "Users can read their own documents"
    on documents for select
    using (
        user_id = (select id from users where id = current_setting('user.id', true))
        or (
            team_id in (
                select team_id from team_members 
                where user_id = current_setting('user.id', true)
            )
            and not is_private
        )
    );

create policy "Users can insert their own documents"
    on documents for insert
    with check (
        user_id = current_setting('user.id', true)
    );

create policy "Users can update their own documents"
    on documents for update
    using (user_id = current_setting('user.id', true))
    with check (user_id = current_setting('user.id', true));

create policy "Users can delete their own documents"
    on documents for delete
    using (user_id = current_setting('user.id', true));

-- Document chunks RLS policies
create policy "Users can read their own document chunks"
    on document_chunks for select
    using (
        user_id = current_setting('user.id', true)
        or (
            team_id in (
                select team_id from team_members 
                where user_id = current_setting('user.id', true)
            )
            and exists (
                select 1 from documents
                where documents.id = document_chunks.document_id
                and not documents.is_private
            )
        )
    );

create policy "Users can insert their own document chunks"
    on document_chunks for insert
    with check (user_id = current_setting('user.id', true));

create policy "Users can update their own document chunks"
    on document_chunks for update
    using (user_id = current_setting('user.id', true))
    with check (user_id = current_setting('user.id', true));

create policy "Users can delete their own document chunks"
    on document_chunks for delete
    using (user_id = current_setting('user.id', true));

-- Update match_documents function to respect ownership
create or replace function match_documents(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    current_user_id text
)
returns table (
    id uuid,
    document_id uuid,
    content text,
    similarity float
)
language plpgsql
as $$
begin
    -- Set the user context for RLS policies
    perform set_config('user.id', current_user_id, true);
    
    return query
    select
        document_chunks.id,
        document_chunks.document_id,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) as similarity
    from document_chunks
    where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    and (
        document_chunks.user_id = current_user_id
        or (
            document_chunks.team_id in (
                select team_id from team_members 
                where user_id = current_user_id
            )
            and exists (
                select 1 from documents
                where documents.id = document_chunks.document_id
                and not documents.is_private
            )
        )
    )
    order by document_chunks.embedding <=> query_embedding
    limit match_count;
end;
$$; 