-- Drop existing trigger and function first
DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_contact_last_contact_date_trigger ON scheduled_activities;
    DROP FUNCTION IF EXISTS update_contact_last_contact_date();
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Add last_contact_date to contacts table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;
EXCEPTION
    WHEN undefined_table THEN
        -- Handle case where contacts table doesn't exist
END $$;

-- Drop dependent tables and recreate them
DO $$ BEGIN
    -- First drop the dependent table
    DROP TABLE IF EXISTS activity_calendar_relations;
    -- Then drop the main table
    DROP TABLE IF EXISTS scheduled_activities;
EXCEPTION
    WHEN undefined_table THEN
        -- Handle case where tables don't exist
END $$;

-- Create scheduled activities table with proper foreign key relationships
CREATE TABLE scheduled_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Recreate the activity_calendar_relations table
CREATE TABLE activity_calendar_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES scheduled_activities(id) ON DELETE CASCADE,
    calendar_event_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_contact_id ON scheduled_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_user_id ON scheduled_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_scheduled_for ON scheduled_activities(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_activity_calendar_relations_activity_id ON activity_calendar_relations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_calendar_relations_calendar_event_id ON activity_calendar_relations(calendar_event_id);

-- Add RLS policies
ALTER TABLE scheduled_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_calendar_relations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all access to scheduled_activities" ON scheduled_activities;
    DROP POLICY IF EXISTS "Enable all access to activity_calendar_relations" ON activity_calendar_relations;
EXCEPTION
    WHEN undefined_object THEN
END $$;

-- Create simple policies that enable all access (auth is handled at top level)
CREATE POLICY "Enable all access to scheduled_activities"
    ON scheduled_activities
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access to activity_calendar_relations"
    ON activity_calendar_relations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to update last_contact_date
CREATE OR REPLACE FUNCTION update_contact_last_contact_date()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contacts
    SET last_contact_date = NEW.scheduled_for
    WHERE id = NEW.contact_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_contact_last_contact_date_trigger
    AFTER INSERT OR UPDATE ON scheduled_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_last_contact_date();