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

## Card Standards (Based on ViewContact)

### 1. Card Structure
```typescript
// Split card pattern
<div className="relative">
  {/* Upper Card */}
  <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
    style={{ 
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
    }}>
    {/* Card content */}
  </div>

  {/* Lower Card */}
  <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
    style={{ 
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', 
      borderTop: '1px solid rgba(255, 255, 255, 0.08)' 
    }}>
    {/* Card content */}
  </div>
</div>
```

### 2. Typography Standards
- Headers: text-xl font-semibold text-white
- Subheaders: text-lg font-medium text-white
- Labels: text-sm text-white/70
- Body text: text-sm text-white/90
- Secondary text: text-sm text-white/60
- Placeholder text: text-white/40

### 3. Input Fields & Forms
```typescript
// Standard form container
<div className="space-y-6 bg-black rounded-xl p-4">
  {/* Form sections */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {/* Form field groups */}
    <div className="space-y-3">
      <Label className="text-sm text-white/70">Field Label</Label>
      <Input
        className="w-full px-4 py-2 bg-black border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/20"
        placeholder="Enter value"
      />
    </div>
  </div>
</div>

// Select field with consistent styling
<div className="space-y-3">
  <Label className="text-sm text-white/70">Select Label</Label>
  <Select>
    <SelectTrigger className="bg-black border-white/10 focus:border-white/20 px-4 py-2">
      <SelectValue placeholder="Select option" className="text-white/40" />
    </SelectTrigger>
    <SelectContent className="bg-black border-white/10">
      <SelectItem className="text-white hover:bg-white/10" />
    </SelectContent>
  </Select>
</div>

// Textarea field
<div className="space-y-3">
  <Label className="text-sm text-white/70">Textarea Label</Label>
  <textarea
    className="min-h-[100px] w-full rounded-md border bg-black px-4 py-3 text-sm shadow-sm placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-white/10 focus:border-white/20"
    placeholder="Enter text..."
  />
</div>

// Button group (e.g., for activity types)
<div className="space-y-3">
  <Label className="text-sm text-white/70">Button Group Label</Label>
  <div className="grid grid-cols-2 gap-3">
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors bg-black border-white/10 hover:border-white/20 text-white/60 hover:text-white/90"
    >
      <Icon className="w-4 h-4" />
      <span>Button Text</span>
    </button>
    {/* Selected state */}
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors bg-blue-500/20 border-blue-500/30 text-blue-400"
    >
      <Icon className="w-4 h-4" />
      <span>Selected Button</span>
    </button>
  </div>
</div>
```

### Form Layout Standards

1. **Spacing**
- Container padding: `p-4`
- Vertical spacing between sections: `space-y-6`
- Vertical spacing between label and input: `space-y-3`
- Grid gap between columns: `gap-6`
- Button group gaps: `gap-3`

2. **Grid Layout**
- Default to single column on mobile: `grid-cols-1`
- Two columns on larger screens: `sm:grid-cols-2`
- Full-width inputs within their columns
- Button groups use appropriate grid columns based on content (e.g., `grid-cols-2` for activity types, `grid-cols-3` for durations)

3. **Input Styling**
- Background: `bg-black`
- Border: `border-white/10`
- Focus border: `focus:border-white/20`
- Text color: `text-white`
- Placeholder: `placeholder:text-white/40`
- Padding: `px-4 py-2`
- Border radius: `rounded-md`

4. **Label Styling**
- Size: `text-sm`
- Color: `text-white/70`
- Spacing below: Part of parent's `space-y-3`

5. **Button States**
- Default: `bg-black border-white/10 text-white/60`
- Hover: `hover:border-white/20 hover:text-white/90`
- Selected: `bg-{color}-500/20 border-{color}-500/30 text-{color}-400`
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`

6. **Form Section Organization**
```typescript
<ExpandableSection title="Section Title" icon={Icon}>
  <div className="space-y-6 bg-black rounded-xl p-4">
    {/* Primary content groups */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Form fields */}
    </div>
    
    {/* Full-width elements */}
    <div className="space-y-3">
      {/* Textarea or full-width inputs */}
    </div>
    
    {/* Action buttons */}
    <div className="flex justify-end">
      <Button className="bg-black border-white/10 hover:bg-white/5">
        Action
      </Button>
    </div>
  </div>
</ExpandableSection>
```

7. **Form Error Handling**
```typescript
// Error message display
<div className="px-6 py-4">
  <div className="text-red-400 text-sm">{error}</div>
</div>

// Input with error state
<Input
  className={cn(
    inputClassName,
    error && "border-red-500/50 focus:border-red-500/70"
  )}
/>
```

8. **Loading States**
```typescript
// Loading spinner for buttons
<Button disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
      Loading...
    </div>
  ) : (
    <>
      <Icon className="w-4 h-4" />
      Action
    </>
  )}
</Button>

// Loading state for form sections
<div className="text-sm text-white/60">Loading...</div>
```

9. **Empty States**
```typescript
// Empty state for lists or sections
<div className="text-sm text-white/60 py-4 text-center">
  No items to display
</div>
```

10. **Form Actions**
```typescript
// Standard action buttons container
<div className="flex justify-end gap-3 mt-6">
  <Button
    variant="ghost"
    onClick={onCancel}
    className="text-white/70 hover:text-white/90"
  >
    Cancel
  </Button>
  <Button
    type="submit"
    disabled={saving || !isValid}
    className="bg-black border-white/10 hover:bg-white/5"
  >
    {saving ? 'Saving...' : 'Save Changes'}
  </Button>
</div>

// Add new item button
<Button
  onClick={onAdd}
  variant="outline"
  className="w-full border-dashed bg-black border-white/10 hover:border-white/20"
>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

11. **Nested Form Sections**
```typescript
// Form within a form section
<div className="space-y-4 p-4 rounded-lg bg-black border border-white/10">
  <div className="space-y-3">
    <Input className={inputClassName} />
  </div>
  <div className="flex justify-end">
    <Button className="bg-black border-white/10 hover:bg-white/5">
      Action
    </Button>
  </div>
</div>
```

12. **Form Field Variants**
```typescript
// Required field label
<Label className="text-sm text-white/70 flex items-center gap-2">
  Field Label
  <span className="text-red-400">*</span>
</Label>

// Field with helper text
<div className="space-y-2">
  <Label className="text-sm text-white/70">Field Label</Label>
  <Input className={inputClassName} />
  <p className="text-xs text-white/40">Helper text provides additional context</p>
</div>

// Field with icon
<div className="relative">
  <Input
    className={cn(inputClassName, "pl-10")}
    placeholder="Search..."
  />
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
</div>
```

### Common Patterns

1. **Date & Time Fields**
```typescript
// Date input with consistent styling
<Input
  type="date"
  className={cn(inputClassName, "px-4 py-2")}
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>

// DateTime input
<Input
  type="datetime-local"
  className={cn(inputClassName, "px-4 py-2")}
  value={datetime?.toISOString().slice(0, 16) || ''}
  onChange={(e) => setDatetime(new Date(e.target.value))}
/>
```

2. **Number Fields**
```typescript
// Number input with constraints
<Input
  type="number"
  min="0"
  max="100"
  className={cn(inputClassName, "px-4 py-2")}
  value={value}
  onChange={(e) => setValue(parseInt(e.target.value))}
/>
```

3. **Conditional Rendering**
```typescript
// Toggle between view/edit modes
{isEditing ? (
  <Input
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className={inputClassName}
  />
) : (
  <div className="text-sm text-white/90">{value || 'Not set'}</div>
)}

// Optional fields
{optionalField && (
  <div className="space-y-3">
    <Label className="text-sm text-white/70">Optional Field</Label>
    <Input className={inputClassName} />
  </div>
)}
```

### Form State Management Standards

### 1. Context-Based Form State
For forms that span multiple sections or components, use the ContactFormContext pattern:

```typescript
// 1. Create a form context (e.g., ContactFormContext.tsx)
interface FormData {
  // Define your form fields
  field1: string;
  field2: string;
  // ...
}

const FormContext = createContext<{
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void;
  resetForm: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
} | undefined>(undefined);

// 2. Wrap your form sections with the provider
<FormProvider>
  <motion.div className="h-full">
    <FormSection section="upper" />
  </motion.div>
  <motion.div className="h-full">
    <FormSection section="lower" />
  </motion.div>
</FormProvider>

// 3. Use the context in your form components
function FormSection() {
  const { 
    formData, 
    updateField, 
    isSubmitting,
    setIsSubmitting,
    error,
    setError 
  } = useFormContext();
  
  // Your form logic here
}
```

### 2. Form Validation Standards
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  
  // 1. Field validation
  const trimmedValues = {
    field1: formData.field1.trim(),
    field2: formData.field2.trim(),
  };
  
  // 2. Required field checks
  if (!trimmedValues.field1) {
    setError('Field 1 is required');
    return;
  }
  
  // 3. Submission state management
  setIsSubmitting(true);
  try {
    await onSubmit(trimmedValues);
    resetForm();
  } catch (err: any) {
    setError(err.message || 'An error occurred');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 3. Form Animation Standards
For split-view forms, use consistent animation patterns:
```typescript
<motion.div
  key="form-section"
  className="h-full"
  initial={{ y: section === 'upper' ? "-100%" : "100%" }}
  animate={{ 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 15
    }
  }}
>
  <FormSection />
</motion.div>
```

### 4. Form Error Handling
```typescript
// 1. Error display component
<div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
  {error}
</div>

// 2. Field-level error states
<Input
  className={cn(
    "w-full px-4 py-2 bg-black border rounded-md text-white",
    "placeholder:text-white/40 focus:border-white/20",
    error && "border-red-500/50 focus:border-red-500/70"
  )}
  aria-invalid={error ? "true" : "false"}
/>

// 3. Loading states
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <LoadingSpinner className="w-4 h-4 mr-2" />
      Saving...
    </>
  ) : 'Save'}
</Button>
```

### 5. Form Field Organization
Group related fields together and maintain consistent spacing:
```typescript
<div className="space-y-6">
  {/* Personal Information */}
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-white mb-4">
      Personal Information
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input name="first_name" label="First Name" required />
      <Input name="last_name" label="Last Name" />
    </div>
  </fieldset>

  {/* Contact Information */}
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-white mb-4">
      Contact Information
    </legend>
    <div className="grid grid-cols-1 gap-4">
      <Input name="email" type="email" label="Email" required />
      <Input name="phone" type="tel" label="Phone" />
    </div>
  </fieldset>
</div>
```

## Animation Standards

### 1. Split View Transitions
```typescript
// Upper section
<motion.div
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
  {/* Upper content */}
</motion.div>

// Lower section
<motion.div
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
  {/* Lower content */}
</motion.div>
```

### 2. Expandable Section Animation
```typescript
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: "auto", 
        opacity: 1,
        transition: {
          height: {
            type: "spring",
            stiffness: 50,
            damping: 15
          },
          opacity: { duration: 0.2 }
        }
      }}
      exit={{ 
        height: 0, 
        opacity: 0,
        transition: {
          height: {
            type: "spring",
            stiffness: 50,
            damping: 15
          },
          opacity: { duration: 0.2 }
        }
      }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

## Color System

### Backgrounds
- Card background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))
- Input fields: bg-black
- Hover states: bg-white/[0.02]

### Borders
- Primary border: border-white/10
- Dividers: border-white/[0.08]
- Focus states: border-white/20

### Text Colors
- Primary text: text-white
- Secondary text: text-white/60
- Tertiary text: text-white/40
- Labels: text-zinc-400
- Icons: text-blue-500

## Button Standards

### Primary Button
```typescript
<Button
  variant="default"
  size="sm"
  className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
>
  <Icon className="w-4 h-4" />
  Button Text
</Button>
```

### Secondary Button
```typescript
<Button
  variant="outline"
  size="sm"
  className="text-white/70 border-white/10 hover:bg-white/5"
>
  <Icon className="w-4 h-4 mr-2" />
  Button Text
</Button>
```

## Accessibility Standards

- All interactive elements must have hover/focus states
- Proper ARIA labels for expandable sections
- Keyboard navigation support
- Color contrast ratios meeting WCAG guidelines
- Screen reader friendly content structure 