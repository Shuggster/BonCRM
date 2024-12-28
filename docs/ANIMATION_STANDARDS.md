# Animation Standards

## Core Animation Principles

### Page Transitions
Every page in the application follows a standardized entrance animation:
1. Content originates from the far right of the viewport (x: "100%")
2. Uses a reverse dissolve effect (opacity: 0 to 1)
3. Slides into its final position (x: 0)
4. Duration: 1.2 seconds
5. Custom easing: [0.32, 0.72, 0, 1] for smooth acceleration/deceleration

```tsx
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
```

### Split View Animations
Split views (like contact details or forms) use a synchronized two-part spring animation:

1. **Container Animation**
   - Slides in from right (x: "100%" to 0)
   - Duration: 1.2 seconds
   - Easing: [0.32, 0.72, 0, 1]
   - Matches page transition timing

2. **Top Section**
   - Slides down from above (y: "-100%" to 0)
   - Uses spring animation with stiffness: 50, damping: 15
   - Synchronized with container animation

3. **Bottom Section**
   - Slides up from below (y: "100%" to 0)
   - Uses spring animation with stiffness: 50, damping: 15
   - Synchronized with container animation

4. **Visual Treatment**
   - Use black backgrounds (`bg-black`) for form sections
   - Maintain consistent rounded corners (`rounded-xl`)
   - Use white/opacity borders for subtle separation
   - Ensure proper z-indexing with `relative` and `z-10` on content containers

```tsx
// Container animation
const containerVariants = {
  initial: { x: "100%" },
  animate: { 
    x: 0,
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: { 
    x: "100%",
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  }
}

// Content animations with spring physics
const topContent = (
  <motion.div 
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
    <div className="relative rounded-xl overflow-hidden bg-black border border-white/[0.08]">
      <div className="relative z-10">
        {/* Top content */}
      </div>
    </div>
  </motion.div>
)

const bottomContent = (
  <motion.div 
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
    <div className="relative rounded-xl overflow-hidden bg-black border border-white/[0.08]">
      <div className="relative z-10">
        {/* Bottom content */}
      </div>
    </div>
  </motion.div>
)
```

### Expandable Sections
Forms use expandable sections for better organization and visibility:

1. **Section Animation**
   - Smooth height animation using `AnimateHeight`
   - Duration: 0.2 seconds
   - Easing: ease-in-out

2. **Section Structure**
   - Header with toggle icon
   - Collapsible content area
   - Maintains form context when collapsed

```tsx
const ExpandableSection = ({ title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-white/[0.08] last:border-none">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-6 py-4 hover:bg-white/[0.02]"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown 
          className={cn(
            "w-5 h-5 transition-transform",
            isExpanded && "rotate-180"
          )} 
        />
      </button>
      <AnimateHeight duration={200} height={isExpanded ? "auto" : 0}>
        <div className="px-6 pb-4">
          {children}
        </div>
      </AnimateHeight>
    </div>
  );
};
```

### State Persistence
Split view state must be handled carefully to avoid hydration issues:

1. **Store Initialization**
   - Initialize with default values
   - Don't access localStorage during SSR
   - Use client-side effects for persistence

2. **Component Structure**
   - Keep `SplitViewContainer` in main layout
   - Use `SplitViewPersistence` for state restoration
   - Ensure single instance of container

3. **State Updates**
   - Update state before animations
   - Persist minimal state (IDs, not content)
   - Handle hydration gracefully

```tsx
// Example persistence implementation
export function SplitViewPersistence() {
  const { setContent, show } = useSplitViewStore()
  
  useEffect(() => {
    const persistedState = localStorage.getItem('splitViewState')
    if (persistedState) {
      const { isVisible, selectedId } = JSON.parse(persistedState)
      if (isVisible) {
        show()
      }
    }
  }, [show])

  return null
}
```

### List Animations
Lists (like contacts, tasks, etc.) follow these animation patterns:

1. **Container Animation**
   - Fades in (opacity: 0 to 1)
   - Duration: 1.2 seconds
   - Matches page transition timing
   - Easing: [0.32, 0.72, 0, 1]

2. **Individual Items**
   - Slide in from right with fade
   - Same timing as container (1.2s)
   - Same easing curve as container

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key="list-container"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 1.2,
          ease: [0.32, 0.72, 0, 1]
        }
      }
    }}
  >
    {items.map(item => (
      <motion.div
        key={item.id}
        variants={{
          hidden: { opacity: 0, x: "100%" },
          visible: { opacity: 1, x: 0 }
        }}
        transition={{
          duration: 1.2,
          ease: [0.32, 0.72, 0, 1]
        }}
      >
        {/* Item content */}
      </motion.div>
    ))}
  </motion.div>
</AnimatePresence>
```

## Important Implementation Notes

1. **Timing Synchronization**
   - Page transitions and container: 1.2s
   - Split view content: Spring animation (stiffness: 50, damping: 15)
   - Expandable sections: 0.2s ease-in-out

2. **Content Attachment**
   - Form content should be attached to its container animation
   - Never animate content separately from its container
   - Use expandable sections for form organization

3. **Performance Considerations**
   - Use `transform` properties (x, y) instead of position properties
   - Animate opacity with transform for better performance
   - Use `will-change` sparingly and only when needed

4. **Accessibility**
   - Respect user's reduced motion preferences
   - Ensure animations don't interfere with screen readers
   - Keep animation durations reasonable for usability

## Example Implementation
See `src/app/(main)/contacts/page.tsx` for a complete reference implementation of these animation standards. 

## Common Issues and Quick Fixes

### Split View Animation Sequence
⚠️ CRITICAL: Split view animations must follow the correct sequence to work properly.

#### Common Problem
The third column animation breaks when `hide()` is called before new content is prepared:
```typescript
// ❌ WRONG - Breaks animation
const handleClick = () => {
  hide();
  setSelectedItem(item);
  requestAnimationFrame(() => {
    setContent(newContent);
    show();
  });
}
```

#### Quick Fix
The correct sequence is:
```typescript
// ✅ CORRECT - Maintains animation
const handleClick = () => {
  const newContent = prepareContent(item);
  setSelectedItem(item);
  setContent(newContent);
  show();
}
```

#### Why This Happens
1. Calling `hide()` first interrupts the animation sequence
2. The animation system needs the old content to still be visible to properly transition to the new content
3. React's state updates and animation frames need to be coordinated

#### Prevention Checklist
- [ ] Never call `hide()` before preparing new content
- [ ] Always prepare new content first
- [ ] Use `show()` only after content is ready
- [ ] Test animations with both fast and slow clicks

### Common Visual Issues and Fixes

#### Grey Lines During Animation
⚠️ CRITICAL: Grey lines can appear during split view animations when using borders.

#### Common Problem
Using borders or solid backgrounds can cause visual artifacts during animation:
```tsx
// ❌ WRONG - Creates grey lines during animation
<div className="rounded-t-2xl bg-[#111111] border border-white/[0.05]">
  {content}
</div>
```

#### Quick Fix
Use gradient backgrounds and backdrop blur instead:
```tsx
// ✅ CORRECT - Seamless animation
<div 
  className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
  style={{ 
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
  }}
>
  <div className="relative z-10">
    {content}
  </div>
</div>
```

#### Why This Happens
1. Borders and solid backgrounds can create hard edges that become visible during transform animations
2. The animation system may render these edges at partial opacity during transitions
3. Using gradients and blur effects creates softer edges that animate more smoothly

#### Prevention Checklist
- [ ] Avoid using borders for depth
- [ ] Use gradient backgrounds instead of solid colors
- [ ] Add backdrop blur for depth
- [ ] Ensure proper z-indexing
- [ ] Test animations at different speeds and screen sizes

## Page Transitions
// ... rest of existing content ... 