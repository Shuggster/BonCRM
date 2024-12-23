-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMPTZ,
    task_group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
    department TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_scheduled_at TIMESTAMPTZ,
    schedule_status TEXT CHECK (schedule_status IN ('unscheduled', 'partially_scheduled', 'fully_scheduled'))
);

-- Create calendar_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL,
    recurrence JSONB,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
    department TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task-event relationship table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.task_calendar_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('deadline', 'working_session', 'review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(task_id, event_id)
);

-- Disable RLS on all tables
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_calendar_relations DISABLE ROW LEVEL SECURITY;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'calendar_events'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add task reference to calendar_events if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'calendar_events' 
        AND column_name = 'related_task_id'
    ) THEN
        ALTER TABLE calendar_events 
        ADD COLUMN related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for performance if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_calendar_relations_task_id') THEN
        CREATE INDEX idx_task_calendar_relations_task_id ON task_calendar_relations(task_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_task_calendar_relations_event_id') THEN
        CREATE INDEX idx_task_calendar_relations_event_id ON task_calendar_relations(event_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_events_related_task_id') THEN
        CREATE INDEX idx_calendar_events_related_task_id ON calendar_events(related_task_id);
    END IF;
END $$; 