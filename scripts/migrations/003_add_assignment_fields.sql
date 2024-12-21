-- Add assignment fields to calendar_events
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add foreign key constraint
ALTER TABLE calendar_events
ADD CONSTRAINT fk_calendar_events_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL; 

-- Add assignment fields to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN IF NOT EXISTS department TEXT CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop'));