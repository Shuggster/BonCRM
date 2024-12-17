-- Check table constraints for tasks
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'tasks'::regclass;
