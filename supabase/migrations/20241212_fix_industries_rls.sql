-- Drop existing policies if they exist
drop policy if exists "Anyone can view industries" on industries;
drop policy if exists "Authenticated users can manage industries" on industries;

-- Enable RLS on industries table
alter table industries enable row level security;

-- Create policy for viewing industries (anyone can view)
create policy "Anyone can view industries"
on industries for select
using (true);

-- Create policy for inserting industries (authenticated users)
create policy "Authenticated users can insert industries"
on industries for insert
with check (auth.role() = 'authenticated');

-- Create policy for updating industries (authenticated users)
create policy "Authenticated users can update industries"
on industries for update
using (auth.role() = 'authenticated');

-- Create policy for deleting industries (authenticated users)
create policy "Authenticated users can delete industries"
on industries for delete
using (auth.role() = 'authenticated');
