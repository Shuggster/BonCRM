# UI Standardization Plan

## Design System Elements

### 1. Layout Patterns
```tsx
// Base container pattern
<main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="mx-auto max-w-[1600px] p-8">
    {/* Content */}
  </div>
</main>

// Grid system
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
  {/* Grid items */}
</div>
```

### 2. Card Components
```tsx
// Base card pattern
<motion.div 
  className="rounded-xl p-6 bg-card relative overflow-hidden"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Card content */}
</motion.div>

// Gradient variations
.card-primary {
  background: linear-gradient(145deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05));
  border: 1px solid rgba(59,130,246,0.1);
}

.card-secondary {
  background: linear-gradient(145deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05));
  border: 1px solid rgba(99,102,241,0.1);
}
```

### 3. Modal Standardization
```tsx
// Standard modal pattern
<Dialog>
  <DialogContent className="max-w-[90vw] bg-[#0F1629] text-white border-white/10">
    <DialogHeader className="px-8 py-6 border-b border-white/10">
      <DialogTitle className="text-xl font-medium">
        {title}
      </DialogTitle>
    </DialogHeader>
    <div className="p-8">
      {/* Modal content */}
    </div>
  </DialogContent>
</Dialog>
```

### 4. Form Components
```tsx
// Input fields
<input
  className="w-full px-3 py-2 bg-[#1C2333] rounded border border-white/10 focus:border-blue-500"
/>

// Select fields
<select
  className="w-full h-10 px-3 bg-[#1C2333] border border-white/10 rounded-md focus:border-blue-500"
/>

// Buttons
<Button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
  {children}
</Button>
```

## Implementation Plan

### Phase 1: Base Components
1. **Create Base Styles**
   - [ ] Define color variables
   - [ ] Create gradient mixins
   - [ ] Set up spacing scale
   - [ ] Define typography system

2. **Layout Components**
   - [ ] Standardize page container
   - [ ] Create grid system
   - [ ] Define responsive breakpoints
   - [ ] Implement backdrop effects

### Phase 2: UI Components
1. **Card System**
   - [ ] Create base card component
   - [ ] Implement gradient variations
   - [ ] Add motion effects
   - [ ] Standardize card layouts

2. **Modal System**
   - [ ] Update Dialog component
   - [ ] Standardize header/footer
   - [ ] Add consistent animations
   - [ ] Implement responsive behavior

3. **Form Elements**
   - [ ] Update input styles
   - [ ] Standardize select components
   - [ ] Create consistent button styles
   - [ ] Implement form layouts

### Phase 3: Advanced Features
1. **Animation System**
   - [ ] Define standard animations
   - [ ] Create motion variants
   - [ ] Implement loading states
   - [ ] Add hover effects

2. **Responsive Design**
   - [ ] Update breakpoints
   - [ ] Implement mobile layouts
   - [ ] Test responsive behavior
   - [ ] Add touch interactions

## Color System

### Primary Colors
```css
--primary: rgb(59,130,246);
--primary-light: rgba(59,130,246,0.1);
--primary-dark: rgb(29,78,216);
```

### Background Colors
```css
--background: rgb(15,22,41);
--background-light: rgba(15,22,41,0.95);
--card-background: rgb(28,35,51);
```

### Text Colors
```css
--text-primary: rgb(255,255,255);
--text-secondary: rgba(255,255,255,0.7);
--text-muted: rgba(255,255,255,0.5);
```

## Typography

### Font Scale
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

## Spacing System
```css
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-4: 1rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-12: 3rem;
```

## Implementation Guidelines

1. **Component Updates**
   - Start with most frequently used components
   - Update one component type at a time
   - Test across all breakpoints
   - Document changes

2. **Testing Process**
   - Visual regression testing
   - Cross-browser testing
   - Mobile device testing
   - Performance testing

3. **Documentation**
   - Create component storybook
   - Document usage patterns
   - Provide example code
   - Include responsive guidelines 