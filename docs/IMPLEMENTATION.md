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
   - Follow the split view animation pattern for forms and details
   - Ensure content is attached to container animations
   - Use synchronized timing (0.8s duration)

3. **Lists and Collections**
   - Implement list container and item animations
   - Match page transition timing (1.2s)
   - Use consistent easing curves

## Reference Implementation
The contacts page (`src/app/(main)/contacts/page.tsx`) serves as the canonical example of:
- Page transitions
- Split view animations
- List animations
- Content attachment
- Timing synchronization

## Key Points
1. Never implement custom animations without consulting ANIMATION_STANDARDS.md
2. Always use the standard components and patterns
3. Maintain consistent timing and easing across the application
4. Test animations across different devices and screen sizes

For detailed animation specifications and examples, refer to ANIMATION_STANDARDS.md 

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

### State Persistence
The split view uses a combination of Zustand store and localStorage for state persistence:

1. **Store Structure**
```typescript
interface SplitViewState {
  isVisible: boolean
  topContent: React.ReactNode | null
  bottomContent: React.ReactNode | null
  selectedId: string | null
  setContent: (top: React.ReactNode | null, bottom: React.ReactNode | null, id?: string | null) => void
  show: () => void
  hide: () => void
  reset: () => void
}
```

2. **Persistence Handling**
- Store initialization with default values
- Client-side persistence via `SplitViewPersistence` component
- Hydration-safe localStorage access

### Animation Sequence
⚠️ **CRITICAL WARNING**: When implementing split views, always follow this sequence:

1. Prepare new content first
2. Update state (selected item, etc.)
3. Set content
4. Show the view

```typescript
// Template for split view click handlers
const handleItemClick = (item: Item) => {
  // 1. Prepare content first
  const newContent = {
    top: <TopContent item={item} />,
    bottom: <BottomContent item={item} />
  };

  // 2. Update state
  setSelectedItem(item);

  // 3. Set content
  setContent(newContent.top, newContent.bottom, item.id);

  // 4. Show the view
  show();
};
```

Common mistakes to avoid:
- Don't call `hide()` before preparing new content
- Don't use `requestAnimationFrame` unless specifically needed
- Don't mix animation sequences
- Don't render `SplitViewContainer` multiple times in the layout
- Don't access localStorage during server-side rendering

See `docs/ANIMATION_STANDARDS.md` for detailed animation guidelines. 