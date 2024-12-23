-- Backup the current tasks data
CREATE TABLE IF NOT EXISTS tasks_backup AS SELECT * FROM tasks;
CREATE TABLE IF NOT EXISTS task_groups_backup AS SELECT * FROM task_groups;
