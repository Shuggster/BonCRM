-- Add missing social media fields
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS whatsapp text;

-- Add descriptions to help with documentation
COMMENT ON COLUMN contacts.facebook IS 'Facebook profile URL or username';
COMMENT ON COLUMN contacts.whatsapp IS 'WhatsApp contact number';

-- Add descriptions to existing columns for better documentation
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
COMMENT ON COLUMN contacts.lead_status IS 'Current status in the sales pipeline';
COMMENT ON COLUMN contacts.lead_source IS 'Source of the lead';
COMMENT ON COLUMN contacts.lead_score IS 'Numeric score (0-100) indicating lead quality';
COMMENT ON COLUMN contacts.expected_value IS 'Expected monetary value of the opportunity';
COMMENT ON COLUMN contacts.probability IS 'Probability of conversion (0-100)';
COMMENT ON COLUMN contacts.next_follow_up IS 'Date and time of next scheduled follow-up';

-- Ensure proper constraints on numeric fields
ALTER TABLE contacts
ALTER COLUMN lead_score SET DEFAULT 0,
ADD CONSTRAINT lead_score_range CHECK (lead_score >= 0 AND lead_score <= 100),
ALTER COLUMN probability SET DEFAULT 0,
ADD CONSTRAINT probability_range CHECK (probability >= 0 AND probability <= 100),
ALTER COLUMN expected_value SET DEFAULT 0;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_contacts_lead_status ON contacts(lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON contacts(lead_score);
CREATE INDEX IF NOT EXISTS idx_contacts_next_follow_up ON contacts(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);

-- Update the updated_at trigger if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'set_contacts_updated_at'
    ) THEN
        CREATE TRIGGER set_contacts_updated_at
        BEFORE UPDATE ON contacts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 