-- Create files table if it doesn't exist
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL,
  team_id UUID,
  department TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 