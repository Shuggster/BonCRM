# Implementation Guide

## Page Structure

Every page in the application should follow this standard structure:

1. **Page Transitions**
   - Use the standardized page transition pattern (see ANIMATION_STANDARDS.md)
   - Implement the reverse dissolve animation from right
   - Match the timing and easing curves exactly

```tsx
export default function SomePage() {
  return (
    <PageTransition>
      <motion.div 
        className="flex-1 flex flex-col min-w-0 bg-black"
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {/* Page content */}
      </motion.div>
    </PageTransition>
  )
}
```

2. **Split Views**
   - Follow the split view animation pattern with spring physics
   - Use synchronized animations for top and bottom content
   - Implement expandable sections for form organization

3. **Form Structure**
   - Use expandable sections for logical grouping
   - Maintain consistent black backgrounds
   - Follow the standard visual hierarchy

## Expandable Sections Pattern

Forms should be organized using expandable sections:

```tsx
function SomeForm() {
  return (
    <div className="space-y-1">
      <ExpandableSection title="Personal Information" defaultExpanded>
        {/* Personal info fields */}
      </ExpandableSection>
      
      <ExpandableSection title="Work Information">
        {/* Work-related fields */}
      </ExpandableSection>
      
      <ExpandableSection title="Additional Details">
        {/* Other fields */}
      </ExpandableSection>
    </div>
  )
}
```

## Reference Implementation
The contacts page (`src/app/(main)/contacts/page.tsx`) serves as the canonical example of:
- Page transitions
- Split view animations with spring physics
- Expandable sections pattern
- Content organization
- Visual hierarchy

## Key Points
1. Never implement custom animations without consulting ANIMATION_STANDARDS.md
2. Always use the standard components and patterns
3. Maintain consistent timing and easing across the application
4. Use expandable sections for form organization
5. Follow the black background standard for forms

## Split View Implementation

### Layout Structure
The split view should be implemented in the main layout file (`src/app/(main)/layout.tsx`), NOT in individual pages:

```typescript
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-black">
      {/* Navigation Column */}
      <Sidebar />
      
      {/* Main Content Column */}
      <div className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full overflow-auto"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Split View Column - Fixed width, separate from main content */}
      <div className="w-[800px] lg:w-[750px] xl:w-[800px] h-full relative">
        <SplitViewContainer />
        <SplitViewPersistence />
      </div>
    </div>
  )
}
```

### Animation Sequence
⚠️ **CRITICAL WARNING**: When implementing split views, always follow this sequence:

1. Hide previous content (if any)
2. Prepare new content with proper sections
3. Set up spring animations
4. Show the view

```typescript
// Template for split view click handlers
const handleItemClick = (item: Item) => {
  // 1. Hide previous content
  hide();
  
  setTimeout(() => {
    // 2. Prepare content with proper sections
    const topContent = (
      <motion.div
        key={item.id}
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
        <ItemView 
          item={item}
          section="upper"
        />
      </motion.div>
    );

    const bottomContent = (
      <motion.div
        key={`${item.id}-bottom`}
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
        <ItemView 
          item={item}
          section="lower"
        />
      </motion.div>
    );

    // 3. Set content with spring animations
    setContent(topContent, bottomContent, item.id);
    
    // 4. Show the view
    show();
  }, 100);
};
```

Common mistakes to avoid:
- Don't skip the hide/show sequence
- Don't mix animation types (stick to spring for split views)
- Don't forget to use expandable sections in forms
- Don't use gradient backgrounds (stick to black)

For detailed animation specifications and examples, refer to ANIMATION_STANDARDS.md 