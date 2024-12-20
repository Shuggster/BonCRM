# Component Structure

## Overview
The Lovable CRM uses a component-based architecture with Next.js 14 App Router.

## Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── lib/
│   │   │   ├── auth-options.ts
│   │   │   ├── session.ts
│   │   │   └── auth.ts
│   │   ├── login/
│   │   │   ├── components/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── calendar/
│   │   └── layout.tsx
│   └── (app)/
│       ├── admin/
│       └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
└── lib/
    ├── supabase.ts
    └── utils.ts
```

## Core Components

### Layout Components

#### Header
```typescript
// components/layout/Header.tsx
export function Header() {
    // User profile, notifications, search
}
```

#### Sidebar
```typescript
// components/layout/Sidebar.tsx
export function Sidebar() {
    // Navigation menu, collapsible sections
}
```

### UI Components

#### Button
```typescript
// components/ui/Button.tsx
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}
```

#### Card
```typescript
// components/ui/Card.tsx
interface CardProps {
    title?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}
```

## Page Components

### Dashboard
```typescript
// app/(main)/dashboard/page.tsx
export default function DashboardPage() {
    // Dashboard layout and data fetching
}
```

### Contacts
```typescript
// app/(main)/contacts/page.tsx
export default function ContactsPage() {
    // Contacts list and management
}
```

## Route Groups

### (auth)
- Authentication related pages
- Login/logout functionality
- Session management

### (main)
- Primary application features
- Protected routes
- User-specific content

### (app)
- Administrative features
- Advanced settings
- System management

## Component Guidelines

### 1. Server vs Client Components
```typescript
// Server Component
export default async function ServerComponent() {
    const data = await fetchData()
    return <div>{data}</div>
}

// Client Component
'use client'
export default function ClientComponent() {
    const [state, setState] = useState()
    return <div>{state}</div>
}
```

### 2. Data Fetching
```typescript
// Server-side data fetching
async function getData() {
    const { data } = await supabase
        .from('table')
        .select()
    return data
}

// Client-side data fetching
function useData() {
    const { data, error } = useSWR('/api/data', fetcher)
    return { data, error }
}
```

### 3. Error Handling
```typescript
// Error boundary component
export function ErrorBoundary({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div role="alert">
            <h2>Something went wrong!</h2>
            <button onClick={reset}>Try again</button>
        </div>
    )
}
```

## State Management

### 1. Context Providers
```typescript
// contexts/sidebar-context.tsx
export const SidebarContext = createContext<{
    isOpen: boolean;
    toggle: () => void;
}>({
    isOpen: false,
    toggle: () => {},
})
```

### 2. Custom Hooks
```typescript
// hooks/use-auth.ts
export function useAuth() {
    const session = useSession()
    const user = session?.user
    return { user, isAuthenticated: !!user }
}
```

## Component Best Practices

1. **Composition**
   - Use composition over inheritance
   - Keep components focused and single-responsibility
   - Implement proper prop drilling prevention

2. **Performance**
   - Use proper memo and callback hooks
   - Implement proper loading states
   - Handle error boundaries

3. **Accessibility**
   - Include proper ARIA labels
   - Ensure keyboard navigation
   - Maintain proper heading hierarchy

4. **Testing**
   - Write unit tests for components
   - Include integration tests
   - Test error states and loading states

## Modal Components and Styling

### Task Edit Modal Structure
When modifying modal styling, understand the component hierarchy:

```
TaskCard.tsx 
  -> TaskEditModal.tsx 
    -> uses Dialog from dialog.tsx
```

### Key Learning Points
1. Modal styling inheritance:
   - Base styles come from dialog.tsx (UI component library)
   - TaskEditModal extends these with custom styling
   - Changes should be made in TaskEditModal.tsx, not in task-modal.tsx

2. Common Pitfalls:
   - Don't modify task-modal.tsx for TaskEditModal changes
   - Check component hierarchy before making style changes
   - Follow the import chain to find the correct component

3. Debugging Modal Styles:
   - Start by checking where the modal is rendered (TaskCard.tsx)
   - Follow the component tree down
   - Look for Dialog component usage
   - Check for style overrides in the immediate component

### Example Structure
```tsx
// TaskEditModal.tsx
<Dialog>
  <DialogContent className="max-w-[90vw] bg-[#0F1629] text-white border-white/10">
    <DialogHeader className="px-8 py-6 border-b border-white/10">
      <DialogTitle>...</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-[2fr,1.5fr,1fr] gap-8">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>
```

This structure ensures consistent modal styling and makes future modifications easier to implement.

## Assignment System Implementation

### User Assignment Pattern
The system implements a consistent user assignment pattern across different modules (tasks, calendar events, contacts). Here's the detailed implementation structure:

### 1. Database Schema Requirements
```sql
-- Required columns for any assignable table
ALTER TABLE your_table
ADD COLUMN assigned_to UUID REFERENCES users(id),
ADD COLUMN assigned_to_type TEXT CHECK (assigned_to_type IN ('user', 'team')),
ADD COLUMN department TEXT;

-- Add foreign key constraint
ALTER TABLE your_table
ADD CONSTRAINT fk_your_table_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id)
ON DELETE SET NULL;
```

### 2. TeamSelect Component Integration
```typescript
// Component usage
<TeamSelect
  onSelect={handleAssignment}
  defaultValue={assignedTo ? { 
    type: assignedToType as 'user' | 'team', 
    id: assignedTo 
  } : undefined}
  includeTeams={true}
  currentDepartment={userDepartment}
  allowCrossDepartment={isAdmin}
/>

// State management in parent component
const [assignedTo, setAssignedTo] = useState<string | null>(null);
const [assignedToType, setAssignedToType] = useState<'user' | 'team' | null>(null);
const [department, setDepartment] = useState<string | null>(null);

// Assignment handler
const handleAssignment = (selection: { 
  type: 'user' | 'team', 
  id: string, 
  department?: string 
}) => {
  setAssignedTo(selection.id);
  setAssignedToType(selection.type);
  setDepartment(selection.department || null);
};
```

### 3. UUID Handling in TeamSelect
Important considerations for handling UUIDs:
- UUIDs may be truncated in the UI but must be full when saving
- Use `includes()` for matching truncated IDs
- Always save the full UUID from the database

```typescript
// Correct UUID handling in TeamSelect
const handleSelection = (value: string) => {
  const [type, id] = value.split('-');
  
  // Find full UUID by matching truncated version
  const selectedUser = users.find(u => u.id.includes(id));
  const selectedTeam = teams.find(t => t.id.includes(id));
  
  // Always use full UUID from database
  const fullId = selectedUser?.id || selectedTeam?.id || id;
  
  onSelect({
    type: type as 'user' | 'team',
    id: fullId,
    department: type === 'user' ? selectedUser?.department : selectedTeam?.department
  });
};
```

### 4. Service Layer Implementation
```typescript
// Service method for saving assignments
async updateItem(item: YourType) {
  const assignmentFields = item.assigned_to && item.assigned_to_type ? {
    assigned_to: item.assigned_to,
    assigned_to_type: item.assigned_to_type,
    department: item.department
  } : {
    assigned_to: null,
    assigned_to_type: null,
    department: null
  };

  const { data, error } = await supabase
    .from('your_table')
    .update({
      ...otherFields,
      ...assignmentFields
    })
    .eq('id', item.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 5. Type Definitions
```typescript
interface AssignableItem {
  assigned_to?: string | null;
  assigned_to_type?: 'user' | 'team' | null;
  department?: string | null;
}

interface YourType extends AssignableItem {
  // Other type fields
}
```

### Key Implementation Points
1. **Database Setup**
   - Always add all three assignment columns (assigned_to, assigned_to_type, department)
   - Include proper foreign key constraints
   - Use UUID for assigned_to field

2. **Component Integration**
   - Use TeamSelect component consistently
   - Handle both user and team assignments
   - Implement department-based filtering
   - Support cross-department assignments for admins

3. **UUID Handling**
   - Always store full UUIDs in the database
   - Handle truncated UUIDs in the UI
   - Use includes() for matching IDs
   - Verify full UUID before saving

4. **State Management**
   - Maintain consistent state structure
   - Handle null values appropriately
   - Update all three fields together
   - Preserve assignments during edits

5. **Error Handling**
   - Validate assignments before saving
   - Handle missing or invalid UUIDs
   - Provide clear error messages
   - Log assignment operations

This pattern ensures consistent user assignment functionality across all modules while handling common edge cases and maintaining data integrity.
