# API & ShugBot Detailed Specifications

## 1. API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "jwt.token.here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }
}
```

### Contacts API

#### List Contacts
```http
GET /api/contacts
Authorization: Bearer <token>
Query Parameters:
- page (default: 1)
- limit (default: 10)
- search
- stage
- status
- sortBy
- sortOrder

Response (200 OK):
{
  "contacts": [{
    "id": "contact_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    // ... other contact fields
  }],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

#### Get Contact
```http
GET /api/contacts/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "contact": {
    "id": "contact_id",
    "firstName": "John",
    "lastName": "Doe",
    // ... other contact fields
  },
  "aiInsights": {
    "relationshipStrength": 0.8,
    "lastInteractionSentiment": "positive",
    "suggestedActions": [
      "Schedule follow-up call",
      "Send product update"
    ]
  }
}
```

#### Create Contact
```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  // ... other contact fields
}

Response (201 Created):
{
  "contact": {
    "id": "new_contact_id",
    // ... created contact data
  }
}
```

### Tasks API

#### List Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
Query Parameters:
- status
- priority
- dueDate
- assignedTo

Response (200 OK):
{
  "tasks": [{
    "id": "task_id",
    "title": "Follow up with client",
    "status": "pending",
    // ... other task fields
  }],
  "total": 50
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Follow up with client",
  "description": "Discuss new proposal",
  "dueDate": "2023-12-01T10:00:00Z",
  "priority": "high",
  "relatedContactId": "contact_id"
}

Response (201 Created):
{
  "task": {
    "id": "new_task_id",
    // ... created task data
  },
  "aiSuggestions": {
    "recommendedPriority": "high",
    "suggestedDeadline": "2023-12-01T10:00:00Z",
    "relatedTasks": ["task_id_1", "task_id_2"]
  }
}
```

## 2. ShugBot Detailed Specification

### 1. Natural Language Processing Features

#### Contact Note Analysis
```typescript
interface NoteAnalysis {
  sentiment: {
    score: number;  // -1 to 1
    label: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
  entities: {
    type: 'person' | 'organization' | 'date' | 'product' | 'custom';
    text: string;
    confidence: number;
  }[];
  keywords: {
    text: string;
    relevance: number;
  }[];
  categories: {
    label: string;
    confidence: number;
  }[];
  concepts: {
    text: string;
    relevance: number;
  }[];
}

// Example Implementation
async function analyzeNote(note: string): Promise<NoteAnalysis> {
  const openai = new OpenAI();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Analyze the following customer interaction note..."
      },
      {
        role: "user",
        content: note
      }
    ]
  });

  return parseAnalysis(response);
}
```

#### Action Item Extraction
```typescript
interface ActionItem {
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'custom';
  description: string;
  suggestedDueDate?: string;
  priority: 'low' | 'medium' | 'high';
  relatedEntities: {
    type: string;
    value: string;
  }[];
}

async function extractActionItems(text: string): Promise<ActionItem[]> {
  // Implementation using OpenAI
}
```

### 2. Relationship Intelligence

#### Contact Scoring
```typescript
interface RelationshipScore {
  overall: number;  // 0 to 100
  factors: {
    responseTime: number;
    interactionFrequency: number;
    sentimentTrend: number;
    engagementLevel: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  suggestions: string[];
}

async function calculateRelationshipScore(
  contactId: string
): Promise<RelationshipScore> {
  // Implementation
}
```

#### Communication Pattern Analysis
```typescript
interface CommunicationPattern {
  preferredTime: {
    dayOfWeek: string[];
    timeOfDay: string[];
  };
  responseLatency: {
    average: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  channelPreference: {
    email: number;
    phone: number;
    meeting: number;
  };
  topics: {
    name: string;
    frequency: number;
    sentiment: number;
  }[];
}
```

### 3. Task Intelligence

#### Priority Prediction
```typescript
interface PriorityPrediction {
  suggestedPriority: 'low' | 'medium' | 'high';
  confidence: number;
  factors: {
    factor: string;
    impact: number;
  }[];
}

async function predictTaskPriority(
  task: Task,
  contact?: Contact
): Promise<PriorityPrediction> {
  // Implementation
}
```

#### Smart Scheduling
```typescript
interface ScheduleSuggestion {
  suggestedDate: string;
  suggestedTime: string;
  confidence: number;
  reasoning: string[];
  alternatives: {
    date: string;
    time: string;
    score: number;
  }[];
}

async function suggestSchedule(
  contactId: string,
  taskType: string
): Promise<ScheduleSuggestion> {
  // Implementation
}
```

### 4. Integration Points

#### Middleware
```typescript
// AI Processing Middleware
const aiProcessingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.notes) {
    req.aiAnalysis = await analyzeNote(req.body.notes);
  }
  next();
};

// Rate Limiting for AI Calls
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

#### WebSocket Events
```typescript
interface AIInsightEvent {
  type: 'new_insight' | 'updated_insight' | 'urgent_action';
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

// WebSocket handler
io.on('connection', (socket) => {
  socket.on('subscribe_ai_insights', (contactId) => {
    socket.join(`ai_insights_${contactId}`);
  });
});
```

### 5. Training & Improvement

#### Feedback Collection
```typescript
interface AIFeedback {
  insightId: string;
  helpful: boolean;
  accuracy: number;
  userComments?: string;
  context: {
    feature: string;
    data: any;
  };
}

async function collectFeedback(
  feedback: AIFeedback
): Promise<void> {
  // Store feedback for model improvement
}
```

#### Model Fine-tuning
```typescript
interface TrainingData {
  type: 'note_analysis' | 'priority_prediction' | 'scheduling';
  input: string;
  expectedOutput: any;
  actualOutput: any;
  feedback: AIFeedback[];
}

async function prepareFineTuningData(): Promise<TrainingData[]> {
  // Collect and prepare training data
}
```

## 3. Error Handling

### API Error Responses
```typescript
interface APIError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

// Example error response
{
  "error": {
    "status": 400,
    "code": "INVALID_INPUT",
    "message": "Invalid contact data provided",
    "details": {
      "email": "Invalid email format",
      "phone": "Phone number is required"
    }
  }
}
```

### AI Processing Errors
```typescript
interface AIProcessingError {
  type: 'timeout' | 'rate_limit' | 'processing_error' | 'model_error';
  message: string;
  retryable: boolean;
  fallbackData?: any;
}

// Example error handling
try {
  const analysis = await analyzeNote(note);
} catch (error) {
  if (error.retryable) {
    // Add to retry queue
    await aiProcessingQueue.add(note);
  } else {
    // Log error and return fallback
    logger.error('AI Processing Error', error);
    return defaultAnalysis;
  }
}
```

## 4. Performance Optimization

### Caching Strategy
```typescript
// Redis cache configuration
const cache = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: 3
});

// Cache AI insights
async function cacheInsights(
  contactId: string,
  insights: any,
  ttl: number = 3600
): Promise<void> {
  await cache.set(
    `insights:${contactId}`,
    JSON.stringify(insights),
    'EX',
    ttl
  );
}
```

### Queue Management
```typescript
// Bull queue configuration
const aiProcessingQueue = new Bull('ai-processing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  limiter: {
    max: 100,
    duration: 1000
  }
});

// Process queue
aiProcessingQueue.process(async (job) => {
  const { type, data } = job.data;
  switch (type) {
    case 'note_analysis':
      return analyzeNote(data);
    case 'priority_prediction':
      return predictTaskPriority(data);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
});
```
