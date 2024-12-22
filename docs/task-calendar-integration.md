# Task-Calendar Integration Plan

## Overview
This document outlines the integration between the Tasks and Calendar modules in the Lovable CRM system, enabling seamless workflow management and improved task tracking through calendar visualization.

## Current State
### Tasks Module
- Full CRUD operations
- User/team assignments
- Department validation
- Status tracking
- Priority levels
- Due date management

### Calendar Module
- Event management
- User assignments
- Department-based visibility
- Category filtering
- Time slot management

## Integration Goals
1. **Task Timeline Visualization**
   - Show task deadlines on calendar
   - Visual indication of task status
   - Priority-based styling
   - Department-aware visibility

2. **Bi-directional Conversion**
   - Convert tasks to calendar events
   - Create tasks from calendar events
   - Maintain relationship tracking
   - Sync status updates

3. **Smart Scheduling**
   - Deadline-based event suggestions
   - Workload distribution view
   - Conflict detection
   - Resource availability checking

## Technical Implementation

### 1. Database Updates
```sql
-- Task-Event Relationship Table
CREATE TABLE task_calendar_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('deadline', 'working_session', 'review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(task_id, event_id)
);

-- Add tracking fields to tasks
ALTER TABLE tasks ADD COLUMN last_scheduled_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN schedule_status TEXT CHECK (schedule_status IN ('unscheduled', 'partially_scheduled', 'fully_scheduled'));

-- Add task reference to calendar_events
ALTER TABLE calendar_events ADD COLUMN related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
```

### 2. Type Definitions
```typescript
interface TaskCalendarRelation {
  id: string;
  taskId: string;
  eventId: string;
  relationType: 'deadline' | 'working_session' | 'review';
  createdAt: string;
  createdBy: string;
}

interface TaskWithSchedule extends Task {
  lastScheduledAt?: string;
  scheduleStatus?: 'unscheduled' | 'partially_scheduled' | 'fully_scheduled';
  relatedEvents?: CalendarEvent[];
}

interface CalendarEventWithTask extends CalendarEvent {
  relatedTaskId?: string;
  task?: Task;
}
```

### 3. Service Layer Updates

#### Task Service
- Add methods for schedule status management
- Implement event relationship tracking
- Add conversion utilities
- Update task status sync

#### Calendar Service
- Add task relationship methods
- Implement deadline visualization
- Add conversion utilities
- Update event status sync

### 4. UI Component Updates

#### Task Modal
```typescript
interface TaskModalProps {
  // ... existing props
  onScheduleTask?: (taskId: string) => void;
  onViewSchedule?: (taskId: string) => void;
}
```

#### Calendar Event Modal
```typescript
interface EventModalProps {
  // ... existing props
  onCreateTask?: (eventData: CalendarEvent) => void;
  relatedTask?: Task;
}
```

### 5. New Components

#### TaskScheduleButton
- Quick action to schedule task
- Status indication
- Schedule preview

#### CalendarTaskIndicator
- Visual task representation
- Status colors
- Priority indication

## Implementation Phases

### Phase 1: Database Foundation
1. Create relationship table
2. Add tracking fields
3. Update existing records
4. Create indexes

### Phase 2: Service Layer
1. Update task service
2. Update calendar service
3. Add conversion utilities
4. Implement sync logic

### Phase 3: UI Components
1. Update task modal
2. Update calendar event modal
3. Add new components
4. Implement visualizations

### Phase 4: Testing & Validation
1. Unit test new features
2. Integration testing
3. Performance testing
4. User acceptance testing

## Testing Strategy

### Unit Tests
1. **Database Operations**
   - Relationship CRUD
   - Constraint validation
   - Cascade behavior

2. **Service Methods**
   - Conversion logic
   - Status sync
   - Relationship management

3. **Components**
   - Render states
   - User interactions
   - Error handling

### Integration Tests
1. **Cross-module Operations**
   - Task-event conversion
   - Status synchronization
   - Relationship management

2. **UI Workflows**
   - Task scheduling
   - Event creation
   - Status updates

## Rollback Plan

### Database
1. Backup before migrations
2. Create down migrations
3. Data preservation strategy

### Code
1. Feature branch strategy
2. Version control
3. Dependency tracking

## Success Metrics
1. Task scheduling efficiency
2. User adoption rate
3. Workflow completion time
4. Error reduction rate

## Next Steps
1. Review and approve database schema
2. Begin database migration implementation
3. Start service layer updates
4. Plan UI component development

## Notes
- Maintain consistent error handling
- Follow existing permission patterns
- Consider bulk operations
- Monitor performance impact 