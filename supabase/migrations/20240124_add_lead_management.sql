-- Create ENUM types for lead status and conversion status
CREATE TYPE lead_status_type AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal',
    'negotiation',
    'won',
    'lost'
);

CREATE TYPE lead_source_type AS ENUM (
    'website',
    'referral',
    'social_media',
    'email_campaign',
    'cold_call',
    'event',
    'other'
);

CREATE TYPE conversion_status_type AS ENUM (
    'lead',
    'opportunity',
    'customer'
);

-- Add lead management columns to contacts table
ALTER TABLE contacts 
    ADD COLUMN lead_status lead_status_type DEFAULT 'new',
    ADD COLUMN lead_source lead_source_type,
    ADD COLUMN lead_score INTEGER DEFAULT 0,
    ADD COLUMN conversion_status conversion_status_type DEFAULT 'lead',
    ADD COLUMN first_contact_date TIMESTAMPTZ,
    ADD COLUMN last_contact_date TIMESTAMPTZ,
    ADD COLUMN expected_value DECIMAL(10,2),
    ADD COLUMN probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    ADD COLUMN next_follow_up TIMESTAMPTZ;

-- Create index for commonly queried fields
CREATE INDEX idx_contacts_lead_status ON contacts(lead_status);
CREATE INDEX idx_contacts_conversion_status ON contacts(conversion_status);
CREATE INDEX idx_contacts_lead_score ON contacts(lead_score);

-- Add trigger to automatically update last_contact_date
CREATE OR REPLACE FUNCTION update_contact_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Set first_contact_date if it's null
    IF NEW.first_contact_date IS NULL THEN
        NEW.first_contact_date := CURRENT_TIMESTAMP;
    END IF;
    
    -- Always update last_contact_date
    NEW.last_contact_date := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_dates_trigger
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_contact_dates();

-- Create a view for lead analytics
CREATE VIEW lead_analytics AS
SELECT 
    lead_status,
    conversion_status,
    COUNT(*) as count,
    AVG(lead_score) as avg_score,
    AVG(probability) as avg_probability,
    SUM(expected_value) as total_potential_value
FROM contacts
GROUP BY lead_status, conversion_status; 