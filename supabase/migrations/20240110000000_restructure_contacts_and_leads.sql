-- First, add missing social media fields to contacts
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Add comments to contact fields
COMMENT ON COLUMN contacts.facebook IS 'Facebook profile URL or username';
COMMENT ON COLUMN contacts.whatsapp IS 'WhatsApp contact number';
COMMENT ON COLUMN contacts.first_name IS 'Contact''s first name';
COMMENT ON COLUMN contacts.last_name IS 'Contact''s last name';
COMMENT ON COLUMN contacts.email IS 'Primary email address';
COMMENT ON COLUMN contacts.phone IS 'Primary phone number';
COMMENT ON COLUMN contacts.company IS 'Company or organization name';
COMMENT ON COLUMN contacts.job_title IS 'Job title or position';
COMMENT ON COLUMN contacts.department IS 'Department within the organization';
COMMENT ON COLUMN contacts.website IS 'Company or personal website URL';
COMMENT ON COLUMN contacts.linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN contacts.twitter IS 'Twitter/X username or profile URL';

-- Create a new leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
    status lead_status_type,
    source lead_source_type,
    score integer DEFAULT 0,
    expected_value numeric DEFAULT 0,
    probability integer DEFAULT 0,
    next_follow_up timestamptz,
    conversion_status conversion_status_type,
    assigned_to uuid,
    assigned_to_type text,
    organization_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT lead_score_range CHECK (score >= 0 AND score <= 100),
    CONSTRAINT probability_range CHECK (probability >= 0 AND probability <= 100)
);

-- Add indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Create trigger for leads updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_leads_updated_at'
    ) THEN
        CREATE TRIGGER set_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_leads_updated_at();
    END IF;
END $$;

-- Migrate existing lead data if needed
INSERT INTO leads (
    contact_id,
    status,
    source,
    score,
    expected_value,
    probability,
    next_follow_up,
    conversion_status,
    assigned_to,
    assigned_to_type,
    organization_id,
    created_at,
    updated_at
)
SELECT 
    id as contact_id,
    lead_status as status,
    lead_source as source,
    lead_score as score,
    expected_value,
    probability,
    next_follow_up,
    conversion_status,
    assigned_to,
    assigned_to_type,
    organization_id,
    created_at,
    updated_at
FROM contacts
WHERE lead_status IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- After successful migration, we can remove these columns from contacts
-- Note: Commenting out for safety, uncomment after verifying data migration
-- ALTER TABLE contacts
-- DROP COLUMN IF EXISTS lead_status,
-- DROP COLUMN IF EXISTS lead_source,
-- DROP COLUMN IF EXISTS lead_score,
-- DROP COLUMN IF EXISTS expected_value,
-- DROP COLUMN IF EXISTS probability,
-- DROP COLUMN IF EXISTS next_follow_up,
-- DROP COLUMN IF EXISTS conversion_status;

-- Update lead_analytics view if it exists
CREATE OR REPLACE VIEW lead_analytics_view AS
SELECT
    status as lead_status,
    COUNT(*) as count,
    COALESCE(AVG(score), 0) as avg_score,
    COALESCE(AVG(probability), 0) as avg_probability,
    COALESCE(SUM(expected_value), 0) as total_potential_value
FROM leads
GROUP BY status; 