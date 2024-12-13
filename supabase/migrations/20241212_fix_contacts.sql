-- Update contacts table to include industry_id
alter table contacts
add column if not exists industry_id uuid references industries(id) on delete set null,
add column if not exists name text generated always as (
    case 
        when last_name is not null then first_name || ' ' || last_name
        else first_name
    end
) stored;

-- Add indexes for performance
create index if not exists contacts_user_id_idx on contacts(user_id);
create index if not exists contacts_industry_id_idx on contacts(industry_id);
create index if not exists contacts_name_idx on contacts(name);
