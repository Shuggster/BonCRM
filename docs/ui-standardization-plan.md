# UI Standardization Plan

## Design System Elements

### 1. Page Transition Pattern
```tsx
// Standard page transition pattern
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

// Split view pattern
const topContent = (
  <motion.div 
    className="h-full bg-[#111111]"
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
    {/* Top content */}
  </motion.div>
)

const bottomContent = (
  <motion.div 
    className="h-full bg-[#111111]"
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
    {/* Bottom content */}
  </motion.div>
)
```

### 2. Layout Patterns
// ... rest of existing layout patterns ...

## Animation Standards

### 1. Page Transitions
- **Main Content**
  - Initial state: Starts from 100% right of the viewport with 0 opacity
  - Animation: Slides in while fading in
  - Duration: 1.2 seconds
  - Easing: [0.32, 0.72, 0, 1]

### 2. Split View Transitions
- **Top Section**
  - Initial state: -100% from top
  - Animation: Slides down to position
  - Duration: 0.8 seconds
  - Easing: [0.4, 0, 0.2, 1]

- **Bottom Section**
  - Initial state: 100% from bottom
  - Animation: Slides up to position
  - Duration: 0.8 seconds
  - Easing: [0.4, 0, 0.2, 1]

### 3. List Item Animations
- **List Container**
  - Initial state: 0 opacity
  - Animation: Fade in
  - Duration: 1.2 seconds
  - Easing: [0.32, 0.72, 0, 1]

- **Individual Items**
  - Initial state: 100% from right with 0 opacity
  - Animation: Slide in while fading in
  - Duration: 1.2 seconds
  - Easing: [0.32, 0.72, 0, 1]

// ... rest of the existing documentation ... 