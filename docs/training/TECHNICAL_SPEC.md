# Technical Specification - Backend Integration

## 1. Architecture Overview
### Current State
- Frontend: React + TypeScript (port 3005)
- Data: Local mock data
- State Management: React Context

### Target State
- Frontend: React + TypeScript (port 3005)
- Backend: Express + Node.js (port 5000)
- Database: MongoDB
- AI Integration: ShugBot
- Authentication: JWT-based

## 2. Database Schema

### Contact Collection
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  stage: Stage;
  notes: Note[];
  preferredContact: ContactMethod;
  purpose: ContactPurpose;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  createdBy: string;
  lastModifiedBy: string;
  nextFollowUpDate: string;
  nextFollowUpTimezone: string;
}
```

### Note Collection
```typescript
{
  id: string;
  contactId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  type: NoteType;
  aiAnalysis?: {
    sentiment: string;
    keywords: string[];
    suggestedActions: string[];
  }
}
```

### Task Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string;
  relatedContactId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}
```

## 3. API Endpoints

### Contact Endpoints
- GET /api/contacts - List all contacts
- GET /api/contacts/:id - Get contact details
- POST /api/contacts - Create new contact
- PUT /api/contacts/:id - Update contact
- DELETE /api/contacts/:id - Delete contact
- GET /api/contacts/:id/notes - Get contact notes
- POST /api/contacts/:id/notes - Add note to contact

### Task Endpoints
- GET /api/tasks - List all tasks
- GET /api/tasks/:id - Get task details
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- GET /api/tasks/due-today - Get tasks due today
- GET /api/tasks/by-contact/:contactId - Get tasks for contact

### Dashboard Endpoints
- GET /api/dashboard/stats - Get dashboard statistics
- GET /api/dashboard/today - Get today's schedule
- GET /api/dashboard/upcoming - Get upcoming activities

## 4. ShugBot Integration

### Features
1. Note Analysis
   - Sentiment analysis of customer interactions
   - Key point extraction
   - Action item identification
   - Follow-up suggestions

2. Task Assistance
   - Priority suggestions based on contact history
   - Due date recommendations
   - Task categorization

3. Contact Insights
   - Relationship strength scoring
   - Engagement pattern analysis
   - Communication style recommendations

### Implementation Steps
1. Setup OpenAI API integration
2. Create middleware for AI processing
3. Implement queuing system for async processing
4. Add AI insights to relevant endpoints

## 5. Implementation Strategy

### Phase 1: Basic Backend Setup
1. Set up Express server
2. Configure MongoDB connection
3. Implement basic CRUD endpoints
4. Add error handling middleware
5. Set up logging

### Phase 2: Data Migration
1. Create MongoDB schemas
2. Write migration scripts for existing data
3. Add data validation
4. Implement data backup strategy

### Phase 3: Authentication & Security
1. Implement JWT authentication
2. Add role-based access control
3. Set up secure environment variables
4. Add request rate limiting

### Phase 4: ShugBot Integration
1. Set up OpenAI API connection
2. Implement note analysis
3. Add task assistance features
4. Integrate contact insights

### Phase 5: Frontend Integration
1. Create API service layer
2. Update context providers
3. Implement error handling
4. Add loading states
5. Update UI for new features

## 6. Testing Strategy

### Backend Tests
1. Unit tests for models
2. Integration tests for API endpoints
3. Authentication tests
4. Rate limiting tests
5. Data validation tests

### Frontend Tests
1. API integration tests
2. Component tests with mocked API
3. Error handling tests
4. Loading state tests

## 7. Monitoring & Maintenance

### Monitoring
1. Server health metrics
2. API response times
3. Database performance
4. Error rates
5. AI processing queue

### Logging
1. API access logs
2. Error logs
3. AI processing logs
4. Authentication attempts
5. Data modifications

## 8. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bonnymans-crm
MONGODB_TEST_URI=mongodb://localhost:27017/bonnymans-crm-test

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# OpenAI
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

## 9. Dependencies to Add

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "winston": "^3.10.0",
    "openai": "^4.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.9.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.4"
  }
}
```

## State Management Architecture

### Context Providers
The application uses React Context for state management. All global contexts are provided at the App level to ensure consistent access throughout the application.

#### Provider Hierarchy
```
App
├── AuthProvider
├── ThemeProvider
├── NotificationProvider
├── UserProvider
├── ContactProvider
├── TagProvider
└── TaskProvider
```

### Context Implementation Guidelines

1. **Provider Location**
   - Global providers are placed in the App component
   - Feature-specific providers may be placed at the feature root level
   - Avoid nesting providers of the same type

2. **State Persistence**
   - Local storage is used for persisting application state
   - Each context implements its own persistence logic
   - Example implementation:
     ```typescript
     const [state, setState] = useState(() => {
       const saved = localStorage.getItem('key');
       return saved ? JSON.parse(saved) : initialState;
     });

     useEffect(() => {
       localStorage.setItem('key', JSON.stringify(state));
     }, [state]);
     ```

3. **Type Safety**
   - All contexts must have complete TypeScript interfaces
   - Context consumers must specify required types
   - Async operations should include proper error handling types

### Feature-Specific Implementations

#### Task Management
- **State**: Tasks, comments, and attachments
- **Storage**: Local storage with JSON serialization
- **Operations**: CRUD operations for tasks and related entities
- **File Handling**: Base64 encoding for attachments

#### Contact Management
- **State**: Contacts and related metadata
- **Storage**: Local storage with JSON serialization
- **Operations**: CRUD operations with optimistic updates
- **Validation**: Type-safe form handling

## Component Architecture

### UI Components
- Implement pure presentation logic
- Receive data and callbacks via props
- Use TypeScript for prop type safety

### Container Components
- Connect to context providers
- Handle business logic and state management
- Implement error handling and loading states

### Shared Components
- Maintain consistent styling
- Accept flexible props for customization
- Include proper TypeScript definitions

## Error Handling

### Context Operations
```typescript
try {
  const result = await operation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Meaningful error message' };
}
```

### Component Error Boundaries
- Implement error boundaries for feature sections
- Provide meaningful error messages to users
- Include recovery options where possible
