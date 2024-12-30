# State Management Standards

## Overview
Our application uses a hybrid state management approach:

1. **Local State**: Component-specific state
2. **React Context**: Feature-scoped shared state
3. **Supabase Realtime**: Real-time data synchronization
4. **URL State**: Shareable/bookmarkable states

## State Management Decision Tree

### When to Use Local State
- Component-specific UI state
- Form state
- Temporary data
- Animation state

Example:
```typescript
function ContactCard() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Component content */}
    </div>
  )
}
```

### When to Use React Context
- Feature-scoped shared state
- Theme/preferences
- Authentication state
- Current user data

Example:
```typescript
// contexts/ContactContext.tsx
interface ContactContextType {
  contacts: Contact[]
  selectedContact: Contact | null
  setSelectedContact: (contact: Contact | null) => void
  isLoading: boolean
  error: Error | null
}

export const ContactContext = createContext<ContactContextType | undefined>(undefined)

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Fetch contacts
  useEffect(() => {
    async function fetchContacts() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
        
        if (error) throw error
        setContacts(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContacts()
  }, [])
  
  // Set up realtime subscription
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
      setSelectedContact,
      isLoading,
      error
    }}>
      {children}
    </ContactContext.Provider>
  )
}

// Hook for consuming context
export function useContacts() {
  const context = useContext(ContactContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider')
  }
  return context
}
```

### When to Use Supabase Realtime
- Real-time data updates
- Collaborative features
- Live notifications
- Activity feeds

Example:
```typescript
function useRealtimeContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  
  useEffect(() => {
    // Initial fetch
    fetchContacts()
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('contacts')
      .on('INSERT', (payload) => {
        setContacts(prev => [...prev, payload.new])
      })
      .on('UPDATE', (payload) => {
        setContacts(prev => prev.map(contact =>
          contact.id === payload.new.id ? payload.new : contact
        ))
      })
      .on('DELETE', (payload) => {
        setContacts(prev => prev.filter(contact =>
          contact.id !== payload.old.id
        ))
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return contacts
}
```

### When to Use URL State
- Current view/tab
- Search queries
- Filter parameters
- Selected items

Example:
```typescript
function ContactList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') || 'grid'
  const search = searchParams.get('q') || ''
  
  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearchParams({ q: e.target.value })}
      />
      <button
        onClick={() => setSearchParams({ view: 'list' })}
      >
        Switch to List
      </button>
    </div>
  )
}
```

## State Organization

### Feature-based Organization
```typescript
src/
  ├── contexts/
  │   ├── contacts/
  │   │   ├── ContactContext.tsx
  │   │   ├── ContactProvider.tsx
  │   │   └── useContacts.ts
  │   └── tasks/
  │       ├── TaskContext.tsx
  │       ├── TaskProvider.tsx
  │       └── useTasks.ts
  └── hooks/
      ├── contacts/
      │   ├── useContactForm.ts
      │   └── useContactSearch.ts
      └── tasks/
          ├── useTaskForm.ts
          └── useTaskFilter.ts
```

### State Initialization
```typescript
// App-level providers
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ContactProvider>
          <TaskProvider>
            {/* App content */}
          </TaskProvider>
        </ContactProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

## Best Practices

1. **State Colocation**
   - Keep state as close as possible to where it's used
   - Lift state up only when necessary
   - Use composition to avoid prop drilling

2. **Performance Optimization**
   - Use `useMemo` for expensive computations
   - Use `useCallback` for callback functions
   - Split context to avoid unnecessary rerenders

3. **Error Handling**
   - Handle loading and error states consistently
   - Provide meaningful error messages
   - Implement retry mechanisms

4. **Type Safety**
   - Define proper TypeScript interfaces
   - Use discriminated unions for complex states
   - Leverage type inference

5. **Testing**
   - Test state changes
   - Mock context providers in tests
   - Test error scenarios 