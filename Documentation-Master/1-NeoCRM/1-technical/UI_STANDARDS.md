# UI Standards & Patterns

## Core Layout Structure

### Three-Column Layout
The application follows a consistent three-column layout pattern:

1. **Navigation Column**
   - Fixed width (64px collapsed, 256px expanded)
   - Contains main navigation and global actions
   - Dark background with subtle borders

2. **Main Content Column**
   - Flexible width (min 40% of remaining space)
   - Primary content area
   - Contains list views, filters, and main interactions

3. **Split View Column**
   - Fixed width (400px)
   - Shows detailed views and forms
   - Supports split view with upper/lower sections

## Card Standards

### 1. Basic Card Structure
```typescript
<div className="bg-[#111111] rounded-2xl border border-white/[0.08]">
  <div className="p-6">
    <div className="flex items-start gap-6">
      {/* Icon Container */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      {/* Content */}
      <div className="flex-1">
        <h2 className="text-2xl font-semibold">Card Title</h2>
        <p className="text-zinc-400 mt-1">Card description</p>
      </div>
    </div>
  </div>
</div>
```

### 2. Info Card Pattern
Used for displaying information in a grid:
```typescript
<div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
  <Icon className="w-5 h-5 text-blue-500" />
  <div>
    <div className="text-sm text-zinc-400">Label</div>
    <div className="text-white">Value</div>
  </div>
</div>
```

### 3. Split View Pattern
The split view pattern uses a single provider to manage state between upper and lower sections, with proper animation:

```typescript
// Provider Setup
const FormContext = createContext<FormContextType | null>(null)

function FormProvider({ children, onSubmit, onCancel, initialData }: FormProviderProps) {
  const [formData, setFormData] = useState(initialData)
  // ... other state and handlers

  return (
    <FormContext.Provider value={{ formData, setFormData, /* other values */ }}>
      {children}
    </FormContext.Provider>
  )
}

// Split Form Container
function SplitForm({ onSubmit, onCancel, defaultValues }: FormProps) {
  return (
    <FormProvider onSubmit={onSubmit} onCancel={onCancel} initialData={defaultValues}>
      <div className="h-[50%]">
        <motion.div
          key="upper"
          className="h-full"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <TopSection />
        </motion.div>
      </div>
      <div className="h-[50%]">
        <motion.div
          key="lower"
          className="h-full"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <BottomSection onCancel={onCancel} />
        </motion.div>
      </div>
    </FormProvider>
  )
}

// Usage
export const Form = {
  createCards: (onSubmit, onCancel, defaultValues) => {
    const content = <SplitForm 
      onSubmit={onSubmit} 
      onCancel={onCancel} 
      defaultValues={defaultValues} 
    />
    return {
      upperCard: content,
      lowerCard: <div /> // Empty div to satisfy interface
    }
  }
}
```

Key points:
- Single provider wraps both sections
- State is shared through context
- Both sections rendered from same provider instance
- Proper spring animation on both sections
- Form data managed in provider state

### 4. Form State Management & Split View Troubleshooting

#### Common Pitfalls
1. **Multiple Provider Instances**
   - ❌ Don't create separate providers for upper/lower cards
   - ❌ Don't split form state between components
   - ✅ Use a single provider wrapping both sections
   - ✅ Share state through context

2. **Animation Issues**
   - ❌ Don't animate cards independently
   - ❌ Don't use different timing for each section
   - ✅ Use consistent spring animation values
   - ✅ Coordinate upper/lower animations from same container

3. **State Synchronization**
   - ❌ Don't manage form state in individual sections
   - ❌ Don't pass state through props between sections
   - ✅ Use context for all shared state
   - ✅ Update state through provider methods

#### Implementation Checklist
```typescript
// 1. Create Context & Types
interface FormData {
  // All form fields
}

interface FormContextType {
  formData: FormData
  setFormData: (data: Partial<FormData>) => void
  handleSubmit: () => void
  // Other shared functionality
}

// 2. Create Provider
const FormContext = createContext<FormContextType | null>(null)

// 3. Implement Provider Component
function FormProvider({ children, onSubmit }) {
  // Initialize all state here
  const [formData, setFormData] = useState(initialState)
  
  // Define all handlers here
  const handleSubmit = () => {
    // Validation
    // Error handling
    // Submit logic
  }
  
  // Provide all values
  return (
    <FormContext.Provider value={{
      formData,
      setFormData,
      handleSubmit,
      // Other values
    }}>
      {children}
    </FormContext.Provider>
  )
}

// 4. Create Hook for Components
function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('Form components must be used within FormProvider')
  }
  return context
}
```

#### Debugging Tips
1. **State Updates Not Reflecting**
   - Check provider wrapping
   - Verify context usage
   - Console log state changes
   - Ensure single source of truth

2. **Animation Glitches**
   - Verify motion.div keys
   - Check transition timing
   - Ensure proper height settings
   - Confirm container structure

3. **Form Submission Issues**
   - Log form data before submit
   - Verify validation logic
   - Check error handling
   - Confirm submit handler chain

#### Best Practices
1. **State Management**
   - Keep all form state in provider
   - Use TypeScript for type safety
   - Implement proper validation
   - Handle all edge cases

2. **Component Structure**
   - Clear separation of concerns
   - Reusable form sections
   - Consistent naming conventions
   - Proper prop typing

3. **Error Handling**
   - Meaningful error messages
   - Proper error state management
   - User-friendly error display
   - Form validation feedback

4. **Performance**
   - Memoize callbacks
   - Optimize re-renders
   - Lazy load components
   - Handle large forms efficiently

## Typography Standards

### Text Styles
- Page Headers: `text-2xl font-semibold text-white`
- Section Headers: `text-xl font-semibold text-white`
- Card Titles: `text-lg font-medium text-white`
- Labels: `text-sm text-zinc-400`
- Body Text: `text-sm text-white/90`
- Secondary Text: `text-sm text-white/60`
- Placeholder Text: `text-white/40`

## Button Standards

### 1. Primary Action Button
```typescript
<Button 
  className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
>
  <Icon className="w-4 h-4" />
  Button Text
</Button>
```

### 2. Secondary Button
```typescript
<Button 
  variant="outline"
  className="border-white/10 hover:bg-white/5"
>
  Button Text
</Button>
```

### 3. Icon Button
```typescript
<Button
  variant="ghost"
  size="icon"
  className="text-white/70 hover:text-white hover:bg-white/10"
>
  <Icon className="w-4 h-4" />
</Button>
```

## Filter Standards

### 1. Filter Container
```typescript
<div className="px-6 py-4 flex items-center gap-4 border-b border-white/[0.08]">
  {/* Filter components */}
</div>
```

### 2. Filter Button
```typescript
<Button 
  variant="outline" 
  size="sm"
  className="border-white/10 hover:bg-white/5"
>
  <Icon className="w-4 h-4 mr-2" />
  Filter Name
</Button>
```

### 3. Active Filter Pill
```typescript
<div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
  Filter Value
</div>
```

## Form Standards

### 1. Input Fields
```typescript
<div className="space-y-3">
  <label className="block text-sm font-medium text-zinc-400">
    Field Label
  </label>
  <input
    className="w-full px-4 py-2 bg-[#111111] border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-white/20"
    placeholder="Enter value"
  />
</div>
```

### 2. Expandable Sections
```typescript
<div className="divide-y divide-white/[0.08]">
  <div className="p-6">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-blue-500" />
      <h3 className="font-medium">Section Title</h3>
    </div>
    <div className="mt-4">
      {/* Section content */}
    </div>
  </div>
</div>
```

## List View Standards

### 1. List Container
```typescript
<div className="flex-1 overflow-auto">
  <div className="divide-y divide-white/10">
    {/* List items */}
  </div>
</div>
```

### 2. List Item
```typescript
<div className="group px-6 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/[0.08] flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium truncate">Item Title</h3>
      <p className="text-sm text-zinc-400 line-clamp-1">Item description</p>
    </div>
  </div>
</div>
```

## Status Indicators

### 1. Status Pills
```typescript
<span className={cn(
  "px-2 py-1 rounded-full text-xs font-medium",
  status === 'active' && "bg-green-500/20 text-green-400",
  status === 'pending' && "bg-yellow-500/20 text-yellow-400",
  status === 'inactive' && "bg-red-500/20 text-red-400"
)}>
  {status}
</span>
```

### 2. Progress Indicators
```typescript
<div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
```

## Color System

### Backgrounds
- Page Background: `bg-black/20`
- Card Background: `bg-[#111111]`
- Hover States: `hover:bg-white/[0.02]`
- Input Fields: `bg-[#111111]`

### Borders
- Primary Border: `border-white/[0.08]`
- Secondary Border: `border-white/10`
- Focus Border: `border-white/20`
- Dividers: `divide-white/[0.08]`

### Text Colors
- Primary Text: `text-white`
- Secondary Text: `text-zinc-400`
- Tertiary Text: `text-white/60`
- Disabled Text: `text-white/40`

### Status Colors
- Success: `bg-green-500/20 text-green-400`
- Warning: `bg-yellow-500/20 text-yellow-400`
- Error: `bg-red-500/20 text-red-400`
- Info: `bg-blue-500/20 text-blue-400`

## Animation Standards

### Page Transitions
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{
    duration: 0.3,
    ease: "easeInOut"
  }}
>
  {/* Page content */}
</motion.div>
```

### List Item Animations
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.3, 
    delay: index * 0.1 
  }}
>
  {/* List item content */}
</motion.div>
```

## Accessibility Standards

- Interactive elements must have hover/focus states
- Proper ARIA labels for interactive elements
- Color contrast ratios meeting WCAG guidelines
- Keyboard navigation support
- Screen reader friendly content structure