-- Drop existing column and trigger if they exist
DROP TRIGGER IF EXISTS update_document_chunks_content_search ON document_chunks;
DROP FUNCTION IF EXISTS update_document_chunks_content_search();
ALTER TABLE document_chunks DROP COLUMN IF EXISTS content_search;

-- Create the column as a generated column
ALTER TABLE document_chunks 
ADD COLUMN content_search tsvector 
GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Create index for text search
DROP INDEX IF EXISTS document_chunks_content_search_idx;
CREATE INDEX document_chunks_content_search_idx ON document_chunks USING GIN (content_search); 