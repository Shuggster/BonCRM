-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    domain TEXT
);

-- Force insert a default organization
INSERT INTO organizations (id, name, domain)
VALUES (
    'bf005f09-1342-4c4a-9c04-2ec0b7a7a868',  -- Using a fixed UUID for consistency
    'Default Organization',
    'default.com'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    domain = EXCLUDED.domain;

-- Add organization_id to contacts if it doesn't exist
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Set default organization for ALL contacts
UPDATE contacts
SET organization_id = 'bf005f09-1342-4c4a-9c04-2ec0b7a7a868'
WHERE organization_id IS NULL;

-- Create user_organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    UNIQUE(user_id, organization_id)
);

-- Enable RLS but allow all operations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable access for all users" ON user_organizations;
CREATE POLICY "Enable access for all users" ON user_organizations FOR ALL USING (true);

-- Create lead scoring rules table
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    points INTEGER NOT NULL,
    conditions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Enable RLS but allow all operations
ALTER TABLE lead_scoring_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable access for all users" ON lead_scoring_rules;
CREATE POLICY "Enable access for all users" ON lead_scoring_rules FOR ALL USING (true);

-- Create function to automatically update lead scores
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
DECLARE
    total_score INTEGER := 0;
BEGIN
    -- Add points based on engagement (20 points)
    IF NEW.last_contact_date IS NOT NULL AND 
       NEW.last_contact_date > (CURRENT_DATE - INTERVAL '30 days') THEN
        total_score := total_score + 20;
    END IF;

    -- Add points based on budget (30 points)
    IF NEW.expected_value IS NOT NULL AND NEW.expected_value >= 50000 THEN
        total_score := total_score + 30;
    END IF;

    -- Add points based on role/seniority (25 points)
    IF NEW.job_title IS NOT NULL AND 
       NEW.job_title ILIKE ANY(ARRAY['%director%', '%vp%', '%chief%', '%head%', '%president%']) THEN
        total_score := total_score + 25;
    END IF;

    -- Add points based on company presence (25 points)
    IF NEW.company IS NOT NULL THEN
        total_score := total_score + 25;
    END IF;

    -- Ensure score is between 0 and 100
    NEW.lead_score := GREATEST(0, LEAST(100, total_score));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update lead score on contact changes
DROP TRIGGER IF EXISTS update_contact_lead_score ON contacts;
CREATE TRIGGER update_contact_lead_score
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_score();

-- Force insert default organization membership
INSERT INTO user_organizations (organization_id, role)
SELECT 
    'bf005f09-1342-4c4a-9c04-2ec0b7a7a868',
    'admin'
ON CONFLICT DO NOTHING; 