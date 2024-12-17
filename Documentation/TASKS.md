# Tasks System Documentation

## Overview
The tasks system allows users to create, manage, and track tasks within the CRM. Each task has properties like title, description, status, priority, and due date.

## Database Schema

### Tasks Table
The tasks table is structured as follows:

```sql
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    related_event UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL
)
```

### Field Descriptions
- `id`: Unique identifier for the task
- `title`: Task title (required)
- `description`: Detailed description of the task (optional)
- `status`: Current status of the task (required)
  - Valid values: 'todo', 'in-progress', 'completed'
- `priority`: Task priority level (required)
  - Valid values: 'low', 'medium', 'high'
- `due_date`: When the task is due (optional)
- `assigned_to`: UUID of the user assigned to the task (optional)
- `related_event`: UUID of a related calendar event (optional)
- `created_at`: Timestamp when the task was created
- `updated_at`: Timestamp when the task was last updated
- `user_id`: UUID of the user who created the task

## Security

### Row Level Security (RLS)
The tasks table uses a simplified RLS policy that allows all authenticated users to access all tasks:

```sql
CREATE POLICY "Allow authenticated access"
    ON public.tasks
    FOR ALL
    TO PUBLIC
    USING (true);
```

## Usage

### Creating a Task
When creating a task, ensure to provide valid values for the required fields:

```typescript
const task = {
  title: "Example Task",       // required
  description: "Details...",   // optional
  status: "todo",             // required: 'todo', 'in-progress', 'completed'
  priority: "medium",         // required: 'low', 'medium', 'high'
  due_date: new Date(),       // optional
  assigned_to: null,          // optional: UUID of assigned user
  related_event: null         // optional: UUID of related event
};
```

### Updating Task Status
Task status can only be set to one of these values:
- 'todo'
- 'in-progress'
- 'completed'

### Setting Priority
Task priority can only be set to one of these values:
- 'low'
- 'medium'
- 'high'
