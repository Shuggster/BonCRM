-- Create files table for uploaded files
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    department TEXT NOT NULL CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing files
CREATE POLICY "Users can view files in their department"
    ON files FOR SELECT
    USING (
        department IN (
            SELECT department 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Create policy for uploading files
CREATE POLICY "Users can upload files to their department"
    ON files FOR INSERT
    WITH CHECK (
        department IN (
            SELECT department 
            FROM users 
            WHERE id = auth.uid()
        )
    );

-- Create policy for deleting files
CREATE POLICY "Users can delete files in their department"
    ON files FOR DELETE
    USING (
        department IN (
            SELECT department 
            FROM users 
            WHERE id = auth.uid()
        )
        AND (
            uploaded_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'manager')
            )
        )
    );

-- Create indexes
CREATE INDEX idx_files_department ON files(department);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by); 