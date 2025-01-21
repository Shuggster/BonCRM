-- Check documents table
SELECT COUNT(*) as doc_count FROM documents;

-- Check document_chunks table
SELECT COUNT(*) as chunk_count FROM document_chunks;

-- Check most recent document
SELECT 
  d.id,
  d.title,
  d.file_name,
  d.metadata,
  LENGTH(d.content) as content_length,
  COUNT(dc.id) as chunk_count,
  MAX(dc.created_at) as latest_chunk
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
GROUP BY d.id, d.title, d.file_name, d.metadata, d.content
ORDER BY d.created_at DESC
LIMIT 1;

-- Check most recent chunks
SELECT 
  id,
  document_id,
  LEFT(content, 100) as content_preview,
  metadata,
  created_at,
  to_tsvector('english', content) IS NOT NULL as has_search_vector
FROM document_chunks
ORDER BY created_at DESC
LIMIT 5; 