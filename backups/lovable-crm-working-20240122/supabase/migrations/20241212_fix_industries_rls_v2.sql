-- Drop existing policies if they exist
drop policy if exists "Anyone can view industries" on industries;
drop policy if exists "Authenticated users can manage industries" on industries;

-- Enable RLS on industries table
alter table industries enable row level security;

-- Create a simple policy that allows all operations
create policy "Enable all operations for all users"
on industries for all
using (true)
with check (true);
