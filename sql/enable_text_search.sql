-- Enable text search on content column
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS content_search tsvector 
GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Create index for text search
CREATE INDEX IF NOT EXISTS document_chunks_content_search_idx 
ON document_chunks USING GIN (content_search); 