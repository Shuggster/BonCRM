# SHUGBOT Integration Guide

## Quick Start
1. Environment Setup:
   ```bash
   DEEPSEEK_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
2. Required Database Tables: `document_chunks` and `shugbot_interactions`
3. Verify department configuration in user session

## Overview
SHUGBOT is an AI assistant integrated with NeoCRM that provides document-aware responses using a combination of Deepseek and Gemini AI models. The system effectively handles both technical documents (like MSDS) and CRM documentation.

## Expanded Features Roadmap

### Phase 1: Enhanced Knowledge Integration
1. Real-time External Knowledge
   - Wikipedia API integration for general knowledge
   - Chemical database integration (PubChem/ChemSpider)
   - Live news feeds for industry updates
   - Rate limiting and caching strategy for external APIs

2. Company Website Integration
   - Web scraper implementation for company site
   - Regular content updates
   - Structured data extraction
   - Integration with existing document search

### Phase 2: Tools Integration Hub
1. Sales and Marketing Tools
   - Lead generation scraper
   - Email campaign integration
   - Analytics dashboard
   - Performance tracking

2. AI-Powered Features
   ```typescript
   // Tool directory structure
   /tools
     /file-manager/  // Document management
     /ai/           // Core AI features
     /ai-test/      // Testing environment
     /shugbot/      // ShugBot components
     /web-scraper/  // Website data extraction
   ```

3. Component Reusability
   - Modular design pattern
   - Shared UI components
   - Common state management
   - Unified styling

### Integration Architecture
```typescript
interface ExternalKnowledgeSource {
  type: 'wikipedia' | 'chemical-db' | 'news' | 'company-site';
  priority: number;
  rateLimit: number;
  cacheStrategy: 'none' | 'short' | 'long';
}

interface ToolIntegration {
  name: string;
  category: 'sales' | 'marketing' | 'analytics';
  permissions: string[];
  apiEndpoint: string;
}
```

## Current Implementation
### Working Features
✅ Dual-model approach (Deepseek primary, Gemini fallback)
✅ Effective document search with exact and broad matching
✅ Clean document title display (timestamp removal)
✅ Proper document citation in responses
✅ Interaction logging for analytics
✅ Department-based access control
✅ Technical term extraction for improved search

### Search Implementation
```typescript
// Two-stage search strategy
1. Exact phrase matching:
   - Uses 'plain' search type
   - Strict matching for precise queries
   - Limited to 5 results

2. Broad matching (fallback):
   - Uses 'websearch' configuration
   - Handles technical terms effectively
   - Limited to 10 results
```

### Document Processing
- Chunks are stored with proper metadata
- Department isolation maintained
- Technical term extraction for specialized searches
- Clean document title presentation

### Database Schema
```sql
document_chunks (
  id uuid PRIMARY KEY,
  content text,
  document_id uuid,
  metadata jsonb,
  department text,
  embedding vector
)

shugbot_interactions (
  id uuid PRIMARY KEY,
  user_id uuid,
  department text,
  query text,
  response text,
  documents_used uuid[],
  timestamp timestamptz
)
```

## AI Configuration
### System Prompt
```typescript
const systemPrompt = `You are ShugBot, a helpful AI assistant for NeoCRM. 
When answering questions:
1. ONLY use information from the provided document context
2. If the exact information isn't in the context, say "I don't see that specific information in the document"
3. Always cite which document and section you found the information in
4. Do not use your general knowledge unless explicitly asked
5. Be concise and to-the-point while maintaining a friendly tone
6. If you find conflicting information in different documents, point this out`;
```

## Lessons Learned - What Not To Do
### 1. Avoid Over-Specialization
❌ Don't create specific handlers for document types
❌ Don't hardcode lists of technical terms
❌ Don't add special cases for particular documents
✅ Keep the search logic general and flexible

### 2. Maintain Simple Search Logic
❌ Don't overcomplicate search with multiple conditions
❌ Don't add complex query building logic
❌ Don't create separate paths for different question types
✅ Keep the dual-search approach (exact + broad)

### 3. Keep Context Management Simple
❌ Don't track conversation history unnecessarily
❌ Don't clear context explicitly
❌ Don't overcomplicate context building
✅ Use straightforward context assembly

### 4. System Prompt Best Practices
❌ Don't make the system message too verbose
❌ Don't separate knowledge types explicitly
❌ Don't over-specify behavior
✅ Keep instructions clear and concise

### 5. Architecture Guidelines
❌ Don't add unnecessary interfaces
❌ Don't create complex conditional branches
❌ Don't overcomplicate error handling
✅ Maintain simple, robust error handling

## Testing
- Verify document search functionality
- Test both AI providers
- Check interaction logging
- Validate department isolation

## Security
- Department-based isolation
- Session validation
- Secure API key handling
- Rate limiting on API routes

## Next Steps
✅ Basic document search and response
✅ Interaction logging
✅ Clean document presentation
- [ ] Performance monitoring
- [ ] Enhanced error reporting
- [ ] User feedback collection
- [ ] Response quality metrics

## Maintenance
- Monitor API usage and costs
- Review interaction logs
- Update system prompt if needed
- Maintain simple architecture 

## Example Interactions
### Technical Document Query
```
User: "What is the specific gravity of Acetic Acid?"
ShugBot: "The specific gravity of Acetic Acid is 1.05. This information is found in the document 'Acetic Acid - Glacial.pdf' under section 9. PHYSICAL AND CHEMICAL PROPERTIES."
```

### Document Not Found Case
```
User: "What is the flash point of methanol?"
ShugBot: "I don't see that specific information in our current documents. Please ensure the MSDS for methanol has been uploaded to your department's documentation."
```

## Integration Roadmap
### Current Features
✅ Basic document search and response
✅ Dual-model AI approach
✅ Clean document presentation
✅ Interaction logging

### Planned Features
Phase 1 - Core Enhancements
- [ ] Enhanced error reporting
- [ ] User feedback collection
- [ ] Response quality metrics
- [ ] Performance monitoring dashboard

Phase 2 - Advanced Features
- [ ] Conversation history (if needed)
- [ ] Document relevance scoring
- [ ] Custom department prompts
- [ ] Analytics dashboard

Phase 3 - Optimization
- [ ] Search performance improvements
- [ ] Caching strategy
- [ ] Rate limit optimization
- [ ] Batch processing for documents

### Integration Points
1. Document Processing
   - Upload pipeline
   - Chunking strategy
   - Metadata extraction

2. Search Optimization
   - Query preprocessing
   - Result ranking
   - Department filtering

3. AI Provider Management
   - Fallback strategy
   - Response formatting
   - Error handling

## Development Guidelines
### Code Structure
```typescript
// Main components:
1. API Route: /api/shugbot/route.ts
2. UI Components: 
   - ShugBotButton.tsx
   - ShugBotModal.tsx
   - ShugBotPopup.tsx
3. State Management: store.ts
```

### Best Practices
1. Search Implementation
   - Always implement both exact and broad search
   - Keep query preprocessing simple
   - Maintain department isolation

2. AI Response Handling
   - Use primary/fallback model pattern
   - Keep system prompt concise
   - Preserve document context

3. Error Handling
   - Log all search attempts
   - Track AI provider failures
   - Maintain user feedback

## Tool Integration Plans
### Sales Lead Generation
- Website scraping for potential leads
- Company information extraction
- Contact detail validation
- Integration with CRM

### Email Campaign Management
- Template generation
- Performance tracking
- A/B testing capabilities
- Analytics integration

### Analytics Dashboard
- Tool usage metrics
- Success rate tracking
- User engagement analysis
- ROI calculations

## Development Priorities
1. External Knowledge Integration
   - API integration framework
   - Rate limiting system
   - Cache management
   - Error handling

2. Website Scraping System
   - Content extraction
   - Regular updates
   - Data structuring
   - Search integration

3. Tool Hub Development
   - Common interface
   - Shared components
   - Permission management
   - Analytics tracking

## RAG and Crawler Integration
### Reusable Components from Existing Agents

1. Document Processing Pipeline
```typescript
interface ProcessedChunk {
  url: string;
  chunkNumber: number;
  title: string;
  summary: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
}
```

2. Smart Chunking Strategy
   - Respects code blocks and paragraphs
   - Dynamic chunk size (default 5000 chars)
   - Intelligent break points:
     - Code block boundaries
     - Paragraph breaks
     - Sentence endings
   - Preserves context integrity

3. Parallel Processing Features
   - Concurrent document processing
   - Rate limiting and throttling
   - Error handling and recovery
   - Progress tracking

4. Enhanced Metadata Extraction
```typescript
interface DocumentMetadata {
  source: string;
  chunkSize: number;
  crawledAt: string;
  urlPath: string;
  department?: string;
  category?: string;
}
```

### Integration Points with ShugBot

1. Website Crawler Integration
   - Reuse AsyncWebCrawler for company website
   - Implement sitemap-based crawling
   - Store processed content in document_chunks
   - Regular update scheduling

2. External Knowledge Sources
   - Wikipedia API wrapper
   - Chemical database connectors
   - News feed processors
   - Cache management system

3. Content Processing Pipeline
```typescript
async function processExternalContent(content: string, source: string) {
  const chunks = smartChunkText(content);
  const processedChunks = await Promise.all(
    chunks.map(async (chunk, index) => {
      const summary = await generateSummary(chunk);
      const embedding = await generateEmbedding(chunk);
      return {
        content: chunk,
        summary,
        embedding,
        metadata: {
          source,
          timestamp: new Date().toISOString(),
          chunkIndex: index
        }
      };
    })
  );
  return processedChunks;
}
```

4. Search Enhancement
   - Multi-source search capability
   - Source prioritization
   - Result ranking and scoring
   - Cache hit optimization

[Previous sections continue...] 