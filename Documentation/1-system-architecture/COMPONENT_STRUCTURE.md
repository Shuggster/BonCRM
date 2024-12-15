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
