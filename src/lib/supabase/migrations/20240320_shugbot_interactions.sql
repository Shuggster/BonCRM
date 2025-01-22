-- Create shugbot_interactions table
CREATE TABLE IF NOT EXISTS shugbot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    department TEXT NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    documents_used UUID[] DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shugbot_interactions_user_id ON shugbot_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shugbot_interactions_department ON shugbot_interactions(department);
CREATE INDEX IF NOT EXISTS idx_shugbot_interactions_timestamp ON shugbot_interactions(timestamp);

-- Enable Row Level Security
ALTER TABLE shugbot_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interactions"
    ON shugbot_interactions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own interactions"
    ON shugbot_interactions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Create function to clean up old interactions (optional)
CREATE OR REPLACE FUNCTION cleanup_old_shugbot_interactions()
RETURNS void AS $$
BEGIN
    DELETE FROM shugbot_interactions
    WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql; 