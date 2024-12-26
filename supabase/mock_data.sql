-- First, create tables if they don't exist
CREATE TABLE IF NOT EXISTS contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_tag_relations (
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES contact_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (contact_id, tag_id)
);

-- Function to purge all data (can be used later to clean up mock data)
CREATE OR REPLACE FUNCTION purge_all_data() 
RETURNS void AS $$
BEGIN
    -- Delete all data from tables that exist
    DELETE FROM task_calendar_relations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_calendar_relations');
    DELETE FROM calendar_events WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events');
    DELETE FROM tasks WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks');
    DELETE FROM contact_activities WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_activities');
    DELETE FROM contact_notes WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_notes');
    DELETE FROM contact_tag_relations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_tag_relations');
    DELETE FROM contact_tags WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_tags');
    DELETE FROM contacts WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts');
END;
$$ LANGUAGE plpgsql;

-- First, purge existing test data
SELECT purge_all_data();

-- Create contact tags first
INSERT INTO contact_tags (name, color) 
VALUES 
    ('Hot Lead', '#ef4444'),      -- Red for high priority
    ('Warm Lead', '#f97316'),     -- Orange for medium priority
    ('Enterprise', '#3b82f6'),    -- Blue for enterprise clients
    ('SMB', '#6366f1'),          -- Indigo for small/medium business
    ('Technical', '#10b981'),     -- Emerald for technical contacts
    ('Decision Maker', '#8b5cf6'), -- Purple for key decision makers
    ('New Contact', '#64748b');   -- Slate for new contacts

-- Now populate with realistic mock data

-- Insert mock contacts with more details
INSERT INTO contacts (
    first_name, last_name, email, phone, company, job_title, 
    address_line1, city, region, postcode, country, website
)
VALUES 
    (
        'James', 'Wilson', 'james.wilson@acme.com', '+44 7700 900123', 
        'Acme Corp', 'Sales Director',
        '123 Business Park Way', 'Manchester', 'Greater Manchester', 'M1 1AA', 'United Kingdom',
        'www.acmecorp.co.uk'
    ),
    (
        'Sarah', 'Thompson', 'sarah.t@innovatech.co.uk', '+44 7700 900124', 
        'InnovaTech', 'CEO',
        '45 Innovation Hub', 'London', 'Greater London', 'EC2A 2BB', 'United Kingdom',
        'www.innovatech.co.uk'
    ),
    (
        'Michael', 'Brown', 'm.brown@globaltech.com', '+44 7700 900125', 
        'Global Tech', 'IT Manager',
        '789 Tech City', 'Birmingham', 'West Midlands', 'B1 1BB', 'United Kingdom',
        'www.globaltech.com'
    ),
    (
        'Emma', 'Davies', 'emma.d@buildright.co.uk', '+44 7700 900126', 
        'BuildRight Construction', 'Project Manager',
        '56 Construction Lane', 'Leeds', 'West Yorkshire', 'LS1 1CC', 'United Kingdom',
        'www.buildright.co.uk'
    ),
    (
        'Oliver', 'Taylor', 'o.taylor@swiftlogistics.com', '+44 7700 900127', 
        'Swift Logistics', 'Operations Director',
        '910 Distribution Centre', 'Liverpool', 'Merseyside', 'L1 1DD', 'United Kingdom',
        'www.swiftlogistics.com'
    );

-- Insert mock tasks with more varied statuses and priorities
INSERT INTO tasks (title, description, status, priority, due_date, user_id)
SELECT 
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    auth.uid()
FROM (VALUES
    ('Follow up with Acme Corp proposal', 'Review and update the sales proposal for James. Need to focus on enterprise features and pricing structure.', 'todo', 'high', NOW() + INTERVAL '2 days'),
    ('Prepare InnovaTech presentation', 'Create slides for next week meeting. Include case studies and ROI analysis.', 'in-progress', 'medium', NOW() + INTERVAL '5 days'),
    ('Global Tech contract review', 'Legal team to review new contract terms. Pay special attention to data protection clauses.', 'todo', 'high', NOW() + INTERVAL '3 days'),
    ('BuildRight site visit', 'Visit construction site for project evaluation. Bring safety equipment and project specs.', 'todo', 'medium', NOW() + INTERVAL '1 week'),
    ('Logistics optimization meeting', 'Discuss supply chain improvements with Swift. Prepare current metrics and improvement targets.', 'completed', 'medium', NOW() - INTERVAL '1 day'),
    ('Weekly team sync', 'Review progress on all active projects and address any blockers.', 'todo', 'low', NOW() + INTERVAL '4 days'),
    ('Client feedback review', 'Analyze recent client feedback and prepare action items.', 'in-progress', 'high', NOW() + INTERVAL '1 day'),
    ('Quarterly planning session', 'Prepare Q2 objectives and key results.', 'todo', 'high', NOW() + INTERVAL '6 days')
) AS t(title, description, status, priority, due_date);

-- Insert mock calendar events with more varied types
INSERT INTO calendar_events (title, description, start_time, end_time, category, user_id)
SELECT 
    e.title,
    e.description,
    e.start_time,
    e.end_time,
    e.category,
    auth.uid()
FROM (VALUES
    ('Acme Corp Meeting', 'Quarterly review with James Wilson - Discuss expansion plans', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 'meeting'),
    ('InnovaTech Presentation', 'Product demo for Sarah - New features showcase', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '3 hours', 'presentation'),
    ('Global Tech Planning', 'IT infrastructure planning - Security focus', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'meeting'),
    ('BuildRight Site Visit', 'Construction site inspection - Phase 2 review', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '4 hours', 'site-visit'),
    ('Swift Logistics Review', 'Monthly performance review - KPI analysis', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours', 'review'),
    ('Team Training Session', 'New software rollout training', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '3 hours', 'training'),
    ('Client Workshop', 'Requirements gathering workshop', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '4 hours', 'workshop'),
    ('Strategy Meeting', 'Annual strategy review and planning', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days' + INTERVAL '6 hours', 'planning')
) AS e(title, description, start_time, end_time, category);

-- Insert mock contact notes with more context
INSERT INTO contact_notes (contact_id, content)
SELECT 
    c.id,
    CASE c.first_name
        WHEN 'James' THEN 'Interested in expanding their software solutions. Follow up needed on enterprise package. Budget confirmed at £250k for initial phase. Decision timeline: Q2 2024.'
        WHEN 'Sarah' THEN 'Looking for long-term partnership. Wants to discuss collaboration opportunities. Currently using competitor product but contract ends in 3 months. Integration requirements noted.'
        WHEN 'Michael' THEN 'Currently evaluating our security features. Schedule technical demo. Has specific requirements around data protection and GDPR compliance. Security audit planned.'
        WHEN 'Emma' THEN 'Needs custom solution for project management. Prepare specialized proposal. Multiple stakeholders involved - need to coordinate with regional offices. ROI focus.'
        WHEN 'Oliver' THEN 'Interested in automation solutions. Share case studies from similar clients. Current pain points: manual tracking, delayed reporting. Quick win opportunities identified.'
    END
FROM contacts c
WHERE c.first_name IN ('James', 'Sarah', 'Michael', 'Emma', 'Oliver');

-- Insert varied mock contact activities
INSERT INTO contact_activities (contact_id, type, description)
SELECT 
    c.id,
    CASE c.first_name
        WHEN 'James' THEN 'meeting'
        WHEN 'Sarah' THEN 'email'
        WHEN 'Michael' THEN 'call'
        WHEN 'Emma' THEN 'site-visit'
        WHEN 'Oliver' THEN 'proposal'
    END,
    CASE c.first_name
        WHEN 'James' THEN 'Initial consultation completed. Positive feedback received. Next steps: technical deep dive.'
        WHEN 'Sarah' THEN 'Sent follow-up email with product specifications and pricing details.'
        WHEN 'Michael' THEN 'Hour-long discovery call completed. Security requirements documented.'
        WHEN 'Emma' THEN 'On-site requirements gathering completed. Project scope defined.'
        WHEN 'Oliver' THEN 'Proposal submitted for automation solution. Awaiting feedback.'
    END
FROM contacts c
WHERE c.first_name IN ('James', 'Sarah', 'Michael', 'Emma', 'Oliver');

-- Add a second activity for each contact
INSERT INTO contact_activities (contact_id, type, description)
SELECT 
    c.id,
    CASE c.first_name
        WHEN 'James' THEN 'proposal'
        WHEN 'Sarah' THEN 'meeting'
        WHEN 'Michael' THEN 'demo'
        WHEN 'Emma' THEN 'call'
        WHEN 'Oliver' THEN 'meeting'
    END,
    CASE c.first_name
        WHEN 'James' THEN 'Sent initial proposal for enterprise package. Budget: £250k'
        WHEN 'Sarah' THEN 'Product demo and Q&A session completed. Very engaged.'
        WHEN 'Michael' THEN 'Technical demo of security features. Positive reception.'
        WHEN 'Emma' THEN 'Follow-up call to discuss timeline and next steps.'
        WHEN 'Oliver' THEN 'Requirements gathering session. Identified key pain points.'
    END
FROM contacts c
WHERE c.first_name IN ('James', 'Sarah', 'Michael', 'Emma', 'Oliver');

-- Create task-calendar relations with more context
INSERT INTO task_calendar_relations (task_id, event_id, relation_type)
SELECT 
    t.id,
    e.id,
    CASE 
        WHEN t.priority = 'high' THEN 'deadline'
        ELSE 'working_session'
    END
FROM tasks t
JOIN calendar_events e ON t.title LIKE '%' || split_part(e.title, ' ', 1) || '%'
LIMIT 5; 

-- After contacts are inserted, add tag relations
INSERT INTO contact_tag_relations (contact_id, tag_id)
SELECT c.id, t.id
FROM contacts c
CROSS JOIN contact_tags t
WHERE 
    (c.first_name = 'James' AND t.name IN ('Hot Lead', 'Enterprise', 'Decision Maker')) OR
    (c.first_name = 'Sarah' AND t.name IN ('Enterprise', 'Decision Maker', 'Technical')) OR
    (c.first_name = 'Michael' AND t.name IN ('Warm Lead', 'Technical', 'Enterprise')) OR
    (c.first_name = 'Emma' AND t.name IN ('Hot Lead', 'SMB', 'Decision Maker')) OR
    (c.first_name = 'Oliver' AND t.name IN ('Warm Lead', 'Enterprise', 'Technical')); 