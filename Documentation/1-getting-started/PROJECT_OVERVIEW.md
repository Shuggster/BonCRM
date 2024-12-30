# Lovable CRM Project Overview

## 🎯 Project Vision
Lovable CRM is a modern, user-friendly customer relationship management system designed to provide a seamless and enjoyable experience for managing customer relationships, tasks, and scheduling.

## ⚠️ Important: UI Migration Status
This project is currently undergoing a UI modernization:
- New features must follow the three-column layout and split-card animation patterns
- Legacy components are being migrated to the new UI system
- When working on features, ensure you're using the new implementation patterns
- **WARNING:** Some old implementation files still exist but should not be modified

## 🏗 Technical Stack & Requirements

### Core Dependencies
- **Node.js**: ^18.0.0
- **Next.js**: ^13.4.0 (with App Router)
- **React**: ^18.2.0
- **TypeScript**: ^5.0.0

### Key Dependencies
- **Database**: Supabase ^2.39.0
- **Styling**: TailwindCSS ^3.3.0
- **Animations**: Framer Motion ^10.16.0
- **Forms**: React Hook Form ^7.45.0 + Zod ^3.22.0
- **UI Components**: shadcn/ui ^0.4.0
- **Icons**: Lucide React ^0.294.0

### State Management
We use a hybrid approach to state management:
1. **Local State**: For component-specific state
2. **React Context**: For shared state within feature boundaries
3. **Supabase Realtime**: For real-time data synchronization
4. **URL State**: For shareable/bookmarkable states

Example Context Usage:
```typescript
// contexts/ContactContext.tsx
export const ContactContext = createContext<ContactContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  
  // Realtime subscription setup
  useEffect(() => {
    const subscription = supabase
      .channel('contacts')
      .on('*', handleRealtimeUpdate)
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <ContactContext.Provider value={{
      contacts,
      selectedContact,
      setSelectedContact
    }}>
      {children}
    </ContactContext.Provider>
  )
}
```

## 📱 Responsive Design
The three-column layout adapts across breakpoints:

- **Desktop** (1024px+):
  - All three columns visible
  - Full functionality

- **Tablet** (768px - 1023px):
  - Navigation collapses to icons
  - Two columns visible
  - Split view as modal

- **Mobile** (< 768px):
  - Single column view
  - Navigation as bottom bar
  - Modal for details/forms

## 📦 Core Features

### 1. Contact Management
- Contact profiles with detailed information
- Tag-based organization
- Activity tracking
- Scheduling system with calendar integration

### 2. Task Management
- Task creation and assignment
- Due date tracking
- Status management
- Task notes and attachments

### 3. Calendar Integration
- Event scheduling
- Meeting management
- Calendar sync
- Activity timeline

### 4. Dashboard
- Recent activities
- Key metrics
- Quick actions
- Performance insights

## 🎨 UI/UX Architecture

### Three-Column Layout
Every page follows our standard three-column layout:

1. **Column 1: Static Navigation**
   - Global navigation
   - Quick actions
   - User settings

2. **Column 2: Main Content**
   - Primary content area
   - List views
   - Search/filter interfaces

3. **Column 3: Split View**
   - Default view (page-specific)
   - Detail view
   - Quick actions

## 🔧 Development Standards

### 1. Code Organization
```typescript
src/
  ├── app/              # Next.js app router pages
  ├── components/       # Reusable components
  │   ├── ui/          # Base UI components
  │   ├── forms/       # Form components
  │   ├── layouts/     # Layout components
  │   └── features/    # Feature-specific components
  ├── lib/             # Utilities and helpers
  ├── hooks/           # Custom React hooks
  ├── contexts/        # React Context providers
  ├── types/           # TypeScript definitions
  └── styles/          # Global styles
```

### 2. Testing Requirements
- Unit tests for utilities (Jest)
- Component tests (React Testing Library)
- E2E tests for critical paths (Playwright)
- Accessibility testing (axe-core)
- Performance testing (Lighthouse)

### 3. Error Handling
```typescript
// Standard error boundary
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={({ error }) => (
        <div className="p-8 bg-red-500/10 rounded-xl border border-red-500/20">
          <h3 className="text-lg font-semibold text-red-400">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-red-300">
            {error.message}
          </p>
        </div>
      )}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}

// API error handling
async function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    toast.error(error.message)
    return
  }
  
  console.error(error)
  toast.error('An unexpected error occurred')
}
```

## 📚 Documentation Structure

```
Documentation/
  ├── 1-getting-started/    # Setup and overview
  │   ├── NEW_AGENT_GUIDE.md
  │   └── PROJECT_OVERVIEW.md
  ├── 2-core-standards/     # UI and code standards
  │   ├── UI_STANDARDS.md
  │   ├── TESTING_STANDARDS.md
  │   └── STATE_MANAGEMENT.md
  ├── 3-implementation/     # Feature guides
  │   ├── CONTACTS.md
  │   ├── TASKS.md
  │   └── CALENDAR.md
  └── 4-maintenance/        # Troubleshooting
      ├── DEPLOYMENT.md
      └── MONITORING.md
```

## 🔄 Development Workflow

### 1. Feature Development
1. Check existing documentation
2. Follow UI/UX standards
3. Implement animations
4. Add tests
5. Update documentation

### 2. Code Review Process
- Follow style guide
- Maintain animation standards
- Ensure accessibility
- Test performance
- Update documentation

## 🎯 Current Focus
- Implementing new UI patterns
- Enhancing animations
- Improving performance
- Maintaining consistency

## 🤝 Contributing
1. Read all documentation
2. Follow existing patterns
3. Maintain consistency
4. Test thoroughly
5. Update documentation

## 📞 Support
- Documentation: /Documentation
- Issues: GitHub Issues
- Questions: Team Chat 