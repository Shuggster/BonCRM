-- Create activity-calendar relationship table
CREATE TABLE IF NOT EXISTS activity_calendar_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES scheduled_activities(id) ON DELETE CASCADE,
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(activity_id, calendar_event_id)
);

-- Enable RLS
ALTER TABLE activity_calendar_relations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity calendar relations"
    ON activity_calendar_relations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scheduled_activities sa
            WHERE sa.id = activity_calendar_relations.activity_id
            AND sa.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own activity calendar relations"
    ON activity_calendar_relations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM scheduled_activities sa
            WHERE sa.id = activity_calendar_relations.activity_id
            AND sa.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_calendar_relations_activity_id 
    ON activity_calendar_relations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_calendar_relations_calendar_event_id 
    ON activity_calendar_relations(calendar_event_id); 