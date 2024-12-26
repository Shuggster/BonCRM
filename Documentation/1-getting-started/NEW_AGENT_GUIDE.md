# New Agent Guide - Lovable CRM

## 👋 Welcome to Lovable CRM!

This guide will help you understand our project structure, current state, and implementation standards. Please read this document completely before starting any development work.

## 🎯 Project Overview

Lovable CRM is a modern, user-friendly customer relationship management system built with:
- Next.js for the frontend
- Supabase for backend/database
- Framer Motion for animations
- TailwindCSS for styling

### Current Implementation Status
- ✅ Dashboard: New UI patterns implemented
- ✅ Contacts: Scheduling system integrated
- ✅ Calendar: Event management
- ✅ Tasks: Assignment system

## 🏗 Core Architecture

### Three-Column Layout Standard
Every page follows our standard three-column layout:

1. **Column 1: Static Navigation**
   - Fixed position
   - Persists across page transitions
   - Global navigation

2. **Column 2: Main Content**
   - Primary content area
   - List views
   - Search/filter interfaces

3. **Column 3: Split View**
   - Default shows two cards that merge
   - Page-specific default views:
     - Dashboard: Recent Updates
     - Contacts: Add New Contact
     - (Other pages TBD)

### Standard Page Load Animation Sequence
1. Column 1 remains static
2. Columns 2 & 3 slide in from right
3. Column 3's split cards merge animation

```typescript
// Standard animation configuration
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

// Split view animation
const splitViewConfig = {
  initial: {
    upper: { y: "-50%" },
    lower: { y: "50%" }
  },
  animate: {
    upper: { y: 0 },
    lower: { y: 0 }
  }
}
```

## 🎨 UI/UX Standards

### Component Structure
```typescript
<PageLayout>
  <StaticNav />  {/* Column 1 */}
  
  <motion.div variants={pageTransitionConfig.columns}>
    <MainContent />  {/* Column 2 */}
    <SplitView>     {/* Column 3 */}
      <UpperCard />
      <LowerCard />
    </SplitView>
  </motion.div>
</PageLayout>
```

### Key Features
1. **Scheduling System**
   - Calendar integration
   - Event management
   - Activity tracking

2. **Tag Management**
   - Contact tagging
   - Tag filtering
   - Bulk tag operations

3. **Search & Filters**
   - Advanced search
   - Smart filters
   - Saved searches

## 🚀 Getting Started

### 1. Before You Code
- Read through this entire document
- Understand the three-column layout
- Review animation patterns
- Check current implementation status

### 2. Development Guidelines
- Follow existing animation patterns
- Maintain consistent styling
- Use provided component structures
- Test across all layout states

### 3. Common Patterns

#### State Management
```typescript
const [data, setData] = useState<Data[]>([])
const [selected, setSelected] = useState<Data | null>(null)
const [view, setView] = useState<ViewPreferences>({})
```

#### Animation Implementation
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}
```

## 🎯 Current Focus
- Implementing new UI patterns across all pages
- Enhancing animation consistency
- Improving user experience
- Maintaining performance

## ⚠️ Important Notes

### Do Not
- Change existing animation patterns
- Modify the three-column layout structure
- Implement features without checking documentation
- Skip animation implementations

### Always
- Follow existing patterns
- Test animations thoroughly
- Maintain consistent styling
- Check responsive behavior

## 📚 Additional Resources

For more detailed information, refer to:
- `/Documentation/2-core-standards/UI_STANDARDS.md`
- `/Documentation/2-core-standards/COMPONENT_LIBRARY.md`
- `/Documentation/3-implementation-guides/`

## 🤝 Need Help?

1. Check the documentation first
2. Review existing implementations
3. Ask for clarification on specific patterns
4. Request additional documentation if needed

Remember: Consistency is key! When in doubt, refer back to this guide or ask for clarification. 