# Calendar Implementation Guide

## Overview

The calendar implementation will follow our 3-column layout pattern while leveraging existing calendar components and database structures.

## ⚠️ Important File Organization Notes

### File Structure and Naming Conventions
```
src/components/calendar/
├── _deprecated/                    # Old files moved here
│   ├── _deprecated_calendar.tsx    # Prefix with _deprecated_
│   └── _deprecated_filters.tsx     # Clear marking of old files
│
├── new/                           # All new UI implementation here
│   ├── Calendar.tsx               # New main container
│   ├── CalendarView.tsx           # New calendar grid
│   ├── EventDetails.tsx           # New right column
│   └── CalendarFilters.tsx        # New filters
```

### Key Rules
1. **Never modify existing files**
   - Old files should be moved to `_deprecated` folder
   - Prefix old files with `_deprecated_` for clarity
   - Keep old files for reference until new implementation is stable

2. **New Implementation Location**
   - All new UI work goes in the `new/` subfolder
   - Create fresh files instead of modifying existing ones
   - Follow new naming conventions consistently

3. **Transition Strategy**
   - Implement new features in isolation
   - Test thoroughly before replacing old components
   - Update imports gradually to point to new components

4. **Common Pitfalls to Avoid**
   - ❌ Don't modify files outside the `new/` directory
   - ❌ Don't mix old and new implementations
   - ❌ Don't remove old files until new ones are proven

### 1. Layout Structure
```
[Static Nav] | [Calendar Overview] | [Event Details]
Column 1     | Column 2           | Column 3
```

## Implementation Steps

### 1. File Structure Updates
```
src/
├── components/
│   └── calendar/
│       └── new/
│           ├── Calendar.tsx        # Main calendar container
│           ├── CalendarView.tsx    # Calendar grid/timeline
│           ├── EventDetails.tsx    # Right column view
│           ├── EventForm.tsx       # Event creation/editing
│           └── CalendarFilters.tsx # Filter components
```

### 2. Existing Components to Leverage
- Base Calendar UI (DayPicker)
- Event drag-and-drop
- Event resizing
- Navigation controls

### 3. Database Integration
Already implemented tables:
- `calendar_events`
- `task_calendar_relations`
- `activity_calendar_relations`

### 4. Features to Implement

#### Column 1: Static Nav
- Reuse existing navigation component
- Add calendar-specific quick actions

#### Column 2: Calendar Overview
1. **Header Section**
   - View toggle (Month/Week/Day)
   - Date navigation
   - Quick date jump
   - Refresh button

2. **Filter Section**
   - Event category filter
   - Date range filter
   - Assignment filter
   - Department filter

3. **Main Calendar View**
   - Responsive grid layout
   - Event cards with status indicators
   - Drag-and-drop zones
   - Multi-select capability

#### Column 3: Event Details
1. **View Mode**
   - Event title and timing
   - Description and category
   - Related tasks/activities
   - Assignment information
   - Action buttons

2. **Edit Mode**
   - Form for event details
   - Recurrence settings
   - Assignment controls
   - Save/Cancel actions

### 5. Animation Standards
- Slide transitions between columns
- Fade effects for event updates
- Smooth drag-and-drop
- Loading state animations

### 6. Integration Points
1. **Task Integration**
   - Link events to tasks
   - Show task deadlines
   - Convert tasks to events

2. **Contact Integration**
   - Schedule contact activities
   - Show contact availability
   - Link events to contacts

3. **Team Integration**
   - Department filtering
   - Team member assignment
   - Availability checking

## Implementation Order

### Phase 1: Basic Structure
1. Set up 3-column layout
2. Implement basic calendar view
3. Create event details panel

### Phase 2: Core Features
1. Event CRUD operations
2. Filter implementation
3. Basic animations

### Phase 3: Advanced Features
1. Drag-and-drop
2. Recurrence handling
3. Integration features

### Phase 4: Polish
1. Animation refinement
2. Performance optimization
3. Edge case handling

## UI/UX Standards

### 1. Color Scheme
- Event categories: Consistent with task priorities
- Status indicators: Match existing patterns
- Selection states: Follow system standards

### 2. Typography
- Event titles: 16px, medium weight
- Times: 14px, regular weight
- Details: 14px, light weight

### 3. Spacing
- Grid cells: 16px padding
- Event cards: 12px padding
- Filter elements: 8px gap

## Testing Strategy

### 1. Component Tests
- Calendar rendering
- Event interactions
- Filter functionality

### 2. Integration Tests
- Data flow
- Task/Contact integration
- Animation sequences

### 3. Performance Tests
- Large calendar datasets
- Animation smoothness
- Filter responsiveness 

## Troubleshooting Guide

### 1. Date Handling Issues
#### Problem: Invalid Date Errors
- **Symptoms:**
  - "Invalid Date" errors in UI
  - Events not displaying correctly
  - Time zone mismatches
- **Common Causes:**
  - Mismatch between database timestamp and UI Date object
  - Using wrong field names (e.g., `start_time` vs `start`)
  - Not converting ISO strings to Date objects
- **Solution:**
  ```typescript
  // When sending to database
  start_time: eventData.start?.toISOString()
  
  // When receiving from database
  start: new Date(dbEvent.start_time)
  ```

### 2. Type System Issues
#### Problem: Type Mismatches
- **Symptoms:**
  - TypeScript errors in event handling
  - Inconsistent data shapes
- **Solution:**
  ```typescript
  // Database type
  interface DbEvent {
    start_time: string;
    end_time: string;
  }
  
  // UI type
  interface CalendarEvent {
    start: Date;
    end: Date;
  }
  ```

### 3. Event Interaction Issues
#### Problem: Drag and Drop Glitches
- **Symptoms:**
  - Events not dragging smoothly
  - Drop zones not registering
  - Visual glitches during drag
- **Solution:**
  - Ensure proper z-index layering
  - Add drag handles for better control
  - Implement proper animation timing

### 4. Performance Issues
#### Problem: Calendar Slowdown
- **Symptoms:**
  - Slow rendering with many events
  - Laggy animations
  - Delayed updates
- **Solution:**
  - Implement virtual scrolling
  - Batch update operations
  - Optimize re-renders

### 5. Integration Issues
#### Problem: Task/Contact Sync
- **Symptoms:**
  - Events not linking properly
  - Missing relations
  - Inconsistent data
- **Solution:**
  - Verify foreign key constraints
  - Implement proper cascading
  - Add data validation

### Prevention Checklist
1. **Before Deployment:**
   - [ ] Review database schema for field names
   - [ ] Check type definitions match database schema
   - [ ] Test with large datasets
   - [ ] Verify all animations are smooth
   - [ ] Test all integration points

2. **Regular Maintenance:**
   - [ ] Monitor performance metrics
   - [ ] Check for orphaned events
   - [ ] Validate data consistency
   - [ ] Update type definitions as needed 

## Key Implementation Patterns

### 1. State Management
```typescript
// Calendar Context
interface CalendarContext {
  currentView: 'month' | 'week' | 'day'
  selectedDate: Date
  events: CalendarEvent[]
  filters: CalendarFilters
  setView: (view: string) => void
  setDate: (date: Date) => void
  refreshEvents: () => void
}

// Event State Shape
interface CalendarEvent {
  id: string
  title: string
  start: Date        // UI-side date object
  end: Date          // UI-side date object
  category: string
  description?: string
  recurrence?: RecurrencePattern
}
```

### 2. Component Communication
- Use context for global state
- Props for direct parent-child communication
- Custom hooks for reusable logic

### 3. Animation Patterns
```typescript
// Slide animations for view changes
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.2 }}
>
  {/* View content */}
</motion.div>

// Fade animations for events
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
>
  {/* Event content */}
</motion.div>
```

### 4. Styling Constants
```typescript
// Event category colors
const EVENT_CATEGORIES = {
  meeting: "bg-blue-500",
  deadline: "bg-red-500",
  reminder: "bg-yellow-500",
  task: "bg-green-500"
} as const

// Common class combinations
const eventCardClasses = cn(
  "rounded-lg p-2",
  "border border-white/10",
  "hover:bg-white/5",
  "transition-all duration-200"
)
```

## Session Context

### 1. Important Files
- `src/components/calendar/calendar-view.tsx` - Main calendar logic
- `src/components/calendar/views/month-view.tsx` - Month view implementation
- `src/components/ui/calendar.tsx` - Base calendar component

### 2. Key Dependencies
- `date-fns` - Date manipulation
- `framer-motion` - Animations
- `@dnd-kit/core` - Drag and drop
- `@radix-ui/react-popover` - Event popovers

### 3. Database Structure
```sql
-- Key tables and relations
calendar_events
├── id: UUID
├── title: TEXT
├── start_time: TIMESTAMPTZ
├── end_time: TIMESTAMPTZ
└── category: TEXT

task_calendar_relations
├── task_id: UUID
├── event_id: UUID
└── relation_type: TEXT
```

## Quick Reference

### 1. Common Operations
```typescript
// Date conversion
const dbToUiEvent = (dbEvent: DbEvent): CalendarEvent => ({
  ...dbEvent,
  start: new Date(dbEvent.start_time),
  end: new Date(dbEvent.end_time)
})

// Event creation
const createEvent = async (event: CalendarEvent) => {
  const dbEvent = {
    ...event,
    start_time: event.start.toISOString(),
    end_time: event.end.toISOString()
  }
  // Database operation...
}
```

### 2. Animation Snippets
```typescript
// Split view transition
const splitViewVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

// Event card animation
const eventCardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
}
```

### 3. Common Issues Quick Fix
- Event not showing: Check timezone conversion
- Drag drop not working: Verify z-index layering
- Animation glitch: Check transition timing
- Performance issue: Implement virtualization
- Type error: Verify database/UI type conversion 