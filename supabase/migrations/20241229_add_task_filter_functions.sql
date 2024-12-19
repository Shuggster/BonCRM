-- Function to copy a preset
CREATE OR REPLACE FUNCTION copy_task_filter_preset(
  preset_id uuid,
  new_name text
) RETURNS task_filter_presets AS $$
DECLARE
  new_preset task_filter_presets;
BEGIN
  INSERT INTO task_filter_presets (
    user_id,
    name,
    filters
  )
  SELECT 
    user_id,
    new_name,
    filters
  FROM task_filter_presets
  WHERE id = preset_id
  RETURNING * INTO new_preset;

  RETURN new_preset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 