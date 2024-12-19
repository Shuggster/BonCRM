-- Add assigned_to column to tasks table
ALTER TABLE tasks 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id); 