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

### Default Views
```typescript
const defaultViews = {
  dashboard: {
    component: RecentUpdates,
    title: "Recent Updates"
  },
  contacts: {
    component: AddNewContact,
    title: "Add New Contact"
  }
  // Add new pages here
}
```

## Animation System

### 1. Page Load/Transition
```typescript
// Animation sequence configuration
const pageTransitionConfig = {
  columns: {
    initial: { x: "100%" },
    animate: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30
      }
    }
  }
}
```

### 2. Split View Animation
```typescript
// Split view animation configuration
const splitViewConfig = {
  initial: {
    upper: { y: "-100%" },
    lower: { y: "100%" }
  },
  animate: {
    upper: { y: 0 },
    lower: { y: 0 },
    transition: {
      type: "tween",
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}
```

### 3. List Animations
```typescript
// Stagger children animations
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
}
```

## Component Standards

### 1. Base Layout Pattern
```typescript
<PageLayout>
  {/* Column 1: Static Nav */}
  <StaticNavigation />
  
  {/* Columns 2 & 3: Animated Content */}
  <motion.div variants={pageTransitionConfig.columns}>
    {/* Column 2: Main Content */}
    <MainContent />
    
    {/* Column 3: Split View */}
    <SplitView>
      <UpperCard />
      <LowerCard />
    </SplitView>
  </motion.div>
</PageLayout>
```

### 2. Card Components
```typescript
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

### 3. Modal Pattern
```typescript
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
```typescript
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

## Design System

### Colors
```css
/* Primary Colors */
--primary: rgb(59,130,246);
--primary-light: rgba(59,130,246,0.1);
--primary-dark: rgb(29,78,216);

/* Background Colors */
--background: rgb(15,22,41);
--background-light: rgba(15,22,41,0.95);
--card-background: rgb(28,35,51);

/* Text Colors */
--text-primary: rgb(255,255,255);
--text-secondary: rgba(255,255,255,0.7);
--text-muted: rgba(255,255,255,0.5);
```

### Typography
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### Spacing
```css
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-4: 1rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-12: 3rem;
```

## Performance Guidelines

### 1. Animation Performance
- Use hardware acceleration
- Implement will-change for heavy animations
- Debounce rapid transitions
- Respect reduced motion preferences

### 2. State Management
- Cache split view state
- Preserve scroll positions
- Maintain navigation state
- Use optimistic updates

## Accessibility Standards

### 1. Animation Control
- Respect reduced motion preferences
- Provide skip animation options
- Ensure keyboard navigation

### 2. Focus Management
- Maintain focus during transitions
- Proper focus trap in split view
- Clear focus indicators

## Testing Requirements

### Visual Testing
- Animation timing consistency
- Split view merge smoothness
- Default view loading
- Responsive behavior

### Functional Testing
- Cross-browser compatibility
- Mobile responsiveness
- Keyboard navigation
- Screen reader compatibility

### Performance Testing
- Animation frame rate
- Load time optimization
- Memory usage
- Network efficiency 