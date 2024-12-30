# UI Standards & Patterns

## Core Layout Structure
The application follows a consistent three-column layout pattern across all pages:

### Column Structure
1. **Column 1: Static Navigation**
   - Fixed width (64px collapsed, 256px expanded)
   - Persists across page transitions
   - Contains main navigation and global actions

2. **Column 2: Main Content Area**
   - Flexible width (min 40% of remaining space)
   - Primary content display
   - Page-specific content and interactions

3. **Column 3: Split View**
   - Fixed width (400px default)
   - Default state shows two cards that merge into one
   - Each page has a designated default view

## Card Standards

### 1. Card Structure
Cards follow a consistent pattern with rounded corners on the first and last cards in a stack:

```typescript
// Single Card Pattern
<div className="bg-[#111111] rounded-2xl">
  <div className="p-8">
    <div className="flex items-start gap-6">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-semibold">Card Title</h2>
        <p className="text-zinc-400 mt-1">Card description</p>
      </div>
    </div>
  </div>
</div>

// Split Card Pattern (for split views)
<div className="relative">
  {/* Upper Card */}
  <div className="h-full bg-[#111111] rounded-t-2xl">
    <div className="p-8">
      {/* Card content */}
    </div>
  </div>

  {/* Lower Card */}
  <div className="h-full bg-[#111111] rounded-b-2xl">
    <div className="p-8 border-t border-white/[0.03]">
      {/* Card content */}
    </div>
  </div>
</div>
```

### 2. Typography Standards
- Headers: text-2xl font-semibold text-white
- Subheaders: text-lg font-medium text-white
- Labels: text-sm text-white/70
- Body text: text-sm text-white/90
- Secondary text: text-sm text-white/60
- Placeholder text: text-white/40

## Form Creation Standards

### 1. Form Component Structure
Forms should be created using our standardized form component structure. Each form follows a three-card pattern with consistent styling:

```typescript
// Form Container Component (e.g., NewContactForm.tsx)
export default function NewContactForm() {
  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form validation setup
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      email: '',
      phone: '',
      notes: ''
    },
    resolver: zodResolver(formSchema)
  })

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Form submission logic
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-[#111111] rounded-t-2xl">
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/[0.05] flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">Basic Information</h2>
              <p className="text-zinc-400 mt-1">Enter the contact's details</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="First Name"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="Enter first name"
                className="bg-[#111111]"
              />
              <Input
                label="Last Name"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Enter last name"
                className="bg-[#111111]"
              />
            </div>
            
            {/* Job Title */}
            <Input
              label="Job Title"
              {...register('jobTitle')}
              error={errors.jobTitle?.message}
              placeholder="Enter job title"
              className="bg-[#111111]"
            />
          </div>
        </div>
      </div>

      {/* Additional Information Card */}
      <div className="bg-[#111111]">
        <div className="p-8">
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Email"
                {...register('email')}
                error={errors.email?.message}
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder="Enter email"
                className="bg-[#111111]"
              />
              <Input
                label="Phone"
                {...register('phone')}
                error={errors.phone?.message}
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                placeholder="Enter phone"
                className="bg-[#111111]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label>Notes</Label>
              <textarea
                {...register('notes')}
                className="w-full min-h-[100px] bg-[#111111] rounded-lg border border-white/10 p-4 text-sm text-white placeholder:text-white/40"
                placeholder="Add any additional notes..."
              />
              {errors.notes?.message && (
                <p className="text-sm text-red-400">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions Card */}
      <div className="bg-[#111111] rounded-b-2xl">
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {/* Handle cancel */}}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#111111] hover:bg-white/5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Contact'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional()
})

### 2. Input Field Standards
All input fields should use our custom Input component with consistent styling:

```typescript
// Standard Input Field
<Input
  label="Field Label"
  {...register('fieldName')}
  error={errors.fieldName?.message}
  placeholder="Enter value"
  className="bg-[#111111]"
/>

// Input with Icon
<Input
  label="Email"
  {...register('email')}
  error={errors.email?.message}
  type="email"
  icon={<Mail className="w-4 h-4" />}
  placeholder="Enter email"
  className="bg-[#111111]"
/>

// Textarea Field
<div className="space-y-3">
  <Label>Notes</Label>
  <textarea
    {...register('notes')}
    className="w-full min-h-[100px] bg-[#111111] rounded-lg border border-white/10 p-4 text-sm text-white placeholder:text-white/40"
    placeholder="Add any additional notes..."
  />
  {errors.notes?.message && (
    <p className="text-sm text-red-400">{errors.notes.message}</p>
  )}
</div>
```

### 3. Form Layout Guidelines
- Use grid layout for multiple fields: `grid grid-cols-2 gap-6`
- Consistent spacing between sections: `space-y-6`
- Consistent padding inside cards: `p-8`
- Icon containers: `w-16 h-16 rounded-xl`
- Form field spacing: `mt-8 space-y-6`
- Error message spacing: `mb-6`
- Button spacing: `gap-4`

### 4. Form Validation and State Management
Forms should implement consistent validation and state management:

```typescript
// Form validation setup
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    // Define default values
  },
  resolver: zodResolver(formSchema)
})

// Form state management
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)

// Form submission handler
const onSubmit = async (data: FormData) => {
  setIsSubmitting(true)
  setError(null)
  try {
    // Form submission logic
  } catch (err) {
    setError(err.message)
  } finally {
    setIsSubmitting(false)
  }
}

// Form validation schema
const formSchema = z.object({
  // Define validation rules
  fieldName: z.string().min(1, 'Field is required'),
  email: z.string().email('Invalid email address'),
  // ...
})
```

## Color System

### Backgrounds
- Card background: `bg-[#111111]`
- Input fields: `bg-[#111111]`
- Hover states: `hover:bg-white/5`

### Gradients
Dashboard metric cards use consistent gradient patterns:
```typescript
const gradientClasses = {
  pink: "from-pink-500/30 to-pink-500/10 hover:from-pink-500/40 hover:to-pink-500/20",
  emerald: "from-emerald-500/30 to-emerald-500/10 hover:from-emerald-500/40 hover:to-emerald-500/20",
  blue: "from-blue-500/30 to-blue-500/10 hover:from-blue-500/40 hover:to-blue-500/20",
  violet: "from-violet-500/30 to-violet-500/10 hover:from-violet-500/40 hover:to-violet-500/20"
}
```

### Borders
- Primary border: `border-white/10`
- Dividers: `border-white/[0.03]`
- Focus states: `border-white/20`

### Text Colors
- Primary text: `text-white`
- Secondary text: `text-white/60`
- Tertiary text: `text-white/40`
- Labels: `text-zinc-400`

## Button Standards

### 1. Primary Action Button
The standard dark button style used across the application:
```typescript
<Button
  className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
>
  <Plus className="w-4 h-4" />
  Button Text
</Button>
```

Key characteristics:
- Dark background (`bg-[#1a1a1a]`)
- Subtle hover state (`hover:bg-[#222]`)
- White border with low opacity (`border border-white/[0.08]`)
- Icon + Text layout with consistent spacing
- Fixed height of 40px (`h-10`)
- Medium font weight
- Rounded corners (`rounded-lg`)

### 2. Ghost Button (Secondary Actions)
Used for secondary actions like Cancel:
```typescript
<Button
  variant="ghost"
  className="text-white/70 hover:text-white hover:bg-white/10"
>
  <X className="w-4 h-4 mr-2" />
  Cancel
</Button>
```

### 3. Loading State
When buttons are in a loading state:
```typescript
<Button
  disabled
  className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
>
  <Loader2 className="w-4 h-4 animate-spin" />
  Loading...
</Button>
```

### 4. Icon-Only Button
For compact UI elements:
```typescript
<Button
  variant="ghost"
  size="icon"
  className="text-white/70 hover:text-white hover:bg-white/10"
>
  <Pencil className="w-4 h-4" />
</Button>
```

## Animation Standards

### Split View Transitions
```typescript
// Upper section
<motion.div
  initial={{ y: "-100%" }}
  animate={{ 
    y: 0,
    transition: {
      type: "tween",
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  }}
>
  {/* Upper content */}
</motion.div>

// Lower section
<motion.div
  initial={{ y: "100%" }}
  animate={{ 
    y: 0,
    transition: {
      type: "tween",
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  }}
>
  {/* Lower content */}
</motion.div>
```

## Accessibility Standards

- All interactive elements must have hover/focus states
- Proper ARIA labels for form fields and buttons
- Keyboard navigation support
- Color contrast ratios meeting WCAG guidelines
- Screen reader friendly content structure 

## Form Components

### Split Form Structure
Forms that use the split animation pattern should follow this exact structure:

```tsx
<div className="h-full flex flex-col rounded-b-2xl">
  <div className="flex-1 flex flex-col min-h-0">
    {/* Upper Section */}
    <motion.div
      key="upper"
      className="flex-none"
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
      <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
           style={{ 
             background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', 
             borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
           }}>
        <div className="relative z-10">
          {/* Form content */}
        </div>
      </div>
    </motion.div>

    {/* Lower Section */}
    <motion.div
      key="lower"
      className="flex-1 min-h-0"
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
      <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
           style={{ 
             background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', 
             borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
           }}>
        <div className="relative z-10">
          {/* Form content */}
        </div>
      </div>
    </motion.div>
  </div>

  {/* Fixed Save Button */}
  <div className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-[#111111] border-t border-white/10 flex justify-between items-center z-50 rounded-b-2xl">
    {/* Action buttons */}
  </div>
</div>
```

Key points:
1. The main container uses `h-full flex flex-col` to ensure proper height distribution
2. The content wrapper uses `flex-1 flex flex-col min-h-0` to prevent overflow
3. Upper section uses `flex-none` while lower section uses `flex-1 min-h-0`
4. Each section has its own gradient background and backdrop blur
5. The fixed save button container sits at the bottom with proper z-index

### Form Sections
Form sections should use the `FormCardSection` component:

```tsx
<FormCardSection
  title="Section Title"
  icon={<Icon className="w-5 h-5 text-blue-500" />}
>
  <div className="space-y-6">
    {/* Form fields */}
  </div>
</FormCardSection>
```

### Form Inputs
Form inputs should use the `FormInput` wrapper and `formInputStyles`:

```tsx
<FormInput label="Field Label">
  <Input
    value={value}
    onChange={onChange}
    className={formInputStyles}
    placeholder="Enter value..."
  />
</FormInput>
```

The `formInputStyles` constant provides consistent styling:
```tsx
export const formInputStyles = "bg-[#111111] border-white/10 focus:border-white/20"
```

### Animation Standards
Split form animations use these spring configurations:
- Stiffness: 50
- Damping: 15
- Initial states: `y: "-100%"` for upper, `y: "100%"` for lower
- No delay between animations

### Background Colors
- Main form background: `bg-[#111111]`
- Section backgrounds: Linear gradient from `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.02)`
- Input backgrounds: `bg-[#111111]`
- Button backgrounds: `bg-[#111111]` with hover state `bg-[#1a1a1a]`

### Border Standards
- Main borders: `border-white/10`
- Focus borders: `border-white/20`
- Section dividers: `border-white/[0.08]`
- Rounded corners: `rounded-2xl` for containers, `rounded-lg` for inputs and buttons

## Filter Button Standards

### 1. Filter Button Pattern
Each filter consists of two parts:
```typescript
// 1. Main Filter Button (Always Visible)
<Button variant="outline" size="sm">
  <Filter className="w-4 h-4 mr-2" />
  Filter Name
</Button>

// 2. Active Filter Pill (Shows when filter is active)
<Button 
  size="sm"
  className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
  onClick={() => clearFilter()}
>
  Filter Name: Selected Value
  <X className="w-4 h-4 ml-2" />
</Button>
```

### 2. Filter Container Structure
```typescript
// Filter Container Component
export function FilterName({ selected, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Name
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">
            Filter by Name
          </div>
          {/* Filter options */}
        </DropdownMenuContent>
      </DropdownMenu>

      {selected && (
        <Button 
          size="sm"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
          onClick={() => onChange(null)}
        >
          Filter Name: {selected}
          <X className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
}
```

### 3. Filter Row Layout
```typescript
<div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.08]">
  <FilterOne />
  <FilterTwo />
  <FilterThree />
</div>
```

### 4. Filter Styling Guidelines
- Main Filter Button:
  - Use `variant="outline" size="sm"`
  - Always include Filter icon
  - Maintain consistent height
  - Dark theme styling

- Active Filter Pill:
  - Blue theme with transparency
  - Include X icon for removal
  - Show selected value
  - Proper hover states

### 5. Filter Dropdown Standards
```typescript
<DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
  {/* Header */}
  <div className="px-2 py-1.5 text-xs font-medium text-white/50">
    Filter by Category
  </div>
  
  {/* Options */}
  <DropdownMenuItem
    className="text-white/70 hover:bg-white/10 hover:text-white"
    onClick={() => selectOption(value)}
  >
    Option Name
  </DropdownMenuItem>
</DropdownMenuContent>
```

Key characteristics:
- Width: 56 units (w-56)
- Black background
- White border with 10% opacity
- Consistent padding
- Header text in muted white
- Hover states on options

// ... existing code ... 