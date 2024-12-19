-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_filter_presets_user_id 
  ON task_filter_presets(user_id);

CREATE INDEX IF NOT EXISTS idx_task_filter_presets_created_at 
  ON task_filter_presets(created_at DESC);

-- Add a unique constraint for user_id + name
ALTER TABLE task_filter_presets 
  ADD CONSTRAINT task_filter_presets_user_id_name_key 
  UNIQUE (user_id, name);

-- Add check constraint for name length
ALTER TABLE task_filter_presets 
  ADD CONSTRAINT task_filter_presets_name_length_check 
  CHECK (char_length(name) BETWEEN 1 AND 100);

-- Add check constraint for filters structure
ALTER TABLE task_filter_presets 
  ADD CONSTRAINT task_filter_presets_filters_check 
  CHECK (jsonb_typeof(filters) = 'object'); 