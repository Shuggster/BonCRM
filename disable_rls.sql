DROP POLICY IF EXISTS \
Enable
read
access
for
related
users\ ON task_calendar_relations; DROP POLICY IF EXISTS \Enable
insert
access
for
task
owners\ ON task_calendar_relations; DROP POLICY IF EXISTS \Enable
delete
access
for
task
owners\ ON task_calendar_relations; ALTER TABLE public.task_calendar_relations DISABLE ROW LEVEL SECURITY;
