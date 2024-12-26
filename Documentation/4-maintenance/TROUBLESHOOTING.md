# Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. Animation Issues

#### Split View Not Merging Correctly
**Problem**: Split view cards don't merge smoothly or get stuck.
```typescript
// Common incorrect implementation
const splitViewConfig = {
  initial: { y: "-50%" },  // Missing separate upper/lower configs
  animate: { y: 0 }
}
```

**Solution**: Use proper split view configuration
```typescript
// Correct implementation
const splitViewConfig = {
  initial: {
    upper: { y: "-50%" },
    lower: { y: "50%" }
  },
  animate: {
    upper: { y: 0 },
    lower: { y: 0 },
    transition: {
      type: "spring",
      stiffness: 40,
      damping: 25
    }
  }
}
```

#### Page Transition Glitches
**Problem**: Content flashes or jumps during page transitions.

**Solution**:
1. Ensure proper exit animations
2. Use layout prop for shared elements
3. Implement proper transition sequence
```typescript
// Correct implementation
<motion.div
  layout
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{
    type: "spring",
    stiffness: 35,
    damping: 30
  }}
>
  {children}
</motion.div>
```

### 2. Layout Issues

#### Column Widths Incorrect
**Problem**: Columns not maintaining proper widths or overflowing.

**Solution**: Use correct width classes and flex properties
```typescript
// Correct implementation
<div className="flex h-full">
  {/* Column 1: Static Nav */}
  <nav className="w-64 shrink-0">
    {/* Navigation content */}
  </nav>
  
  {/* Column 2: Main Content */}
  <main className="flex-1 min-w-[40%]">
    {/* Main content */}
  </main>
  
  {/* Column 3: Split View */}
  <aside className="w-[400px] shrink-0">
    {/* Split view content */}
  </aside>
</div>
```

#### Responsive Layout Breaking
**Problem**: Layout breaks on mobile or tablet views.

**Solution**: Implement proper responsive classes
```typescript
<div className="flex flex-col lg:flex-row h-full">
  <nav className="h-16 lg:h-full lg:w-64">
    {/* Navigation */}
  </nav>
  <main className="flex-1">
    {/* Content */}
  </main>
</div>
```

### 3. Performance Issues

#### Animation Performance
**Problem**: Animations causing frame drops or stuttering.

**Solution**:
1. Use hardware acceleration
```typescript
// Add transform-gpu class
<motion.div className="transform-gpu">
  {/* Animated content */}
</motion.div>
```

2. Implement will-change
```css
.animated-element {
  will-change: transform, opacity;
}
```

3. Reduce animation complexity
```typescript
// Simplify animations for better performance
const simpleVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}
```

#### Memory Leaks
**Problem**: Memory usage increases over time.

**Solution**: Clean up effects and listeners
```typescript
useEffect(() => {
  const handler = () => {
    // Event handling
  }
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

### 4. State Management Issues

#### Stale State
**Problem**: Components not updating with latest state.

**Solution**: Use proper dependency arrays and state updates
```typescript
// Correct implementation
const [data, setData] = useState([])
const [filters, setFilters] = useState({})

useEffect(() => {
  fetchData(filters)
}, [filters]) // Include all dependencies

// Use functional updates for previous state
setData(prev => [...prev, newItem])
```

#### Context Performance
**Problem**: Unnecessary re-renders from context updates.

**Solution**: Split context and use memoization
```typescript
// Split contexts
const DataContext = createContext()
const DispatchContext = createContext()

// Use memo for expensive computations
const memoizedValue = useMemo(() => computeValue(data), [data])

// Memoize handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [/* dependencies */])
```

### 5. Build & Deployment Issues

#### Build Failures
**Problem**: Production build failing.

**Solution**: Common fixes:
1. Clear cache and node_modules
```bash
rm -rf .next node_modules
npm install
```

2. Check for type errors
```bash
npm run type-check
```

3. Verify environment variables
```bash
# Ensure all required variables are set
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> .env.local
```

#### API Connection Issues
**Problem**: API calls failing in production.

**Solution**: Verify environment and cors settings
```typescript
// Correct API URL configuration
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Proper fetch implementation
async function fetchData() {
  try {
    const response = await fetch(`${apiUrl}/api/data`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Network response was not ok')
    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
```

## 🔍 Debugging Tools

### 1. React DevTools
- Component inspection
- Performance profiling
- State tracking

### 2. Chrome DevTools
- Network monitoring
- Performance recording
- Memory profiling

### 3. Logging
```typescript
// Implement consistent logging
const logger = {
  debug: (...args) => console.debug('[DEBUG]', ...args),
  info: (...args) => console.info('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
}

// Usage
logger.debug('Component mounted', { props, state })
```

## 📋 Checklist Before Seeking Help

1. **Verify Setup**
   - [ ] Node.js version correct
   - [ ] Dependencies installed
   - [ ] Environment variables set
   - [ ] Cache cleared

2. **Check Common Issues**
   - [ ] Console errors
   - [ ] Network requests
   - [ ] Animation timing
   - [ ] Layout structure

3. **Gather Information**
   - [ ] Error messages
   - [ ] Steps to reproduce
   - [ ] Environment details
   - [ ] Recent changes

## 🆘 Getting Help

1. **Documentation**
   - Check relevant documentation sections
   - Review implementation guides
   - Search troubleshooting guide

2. **Team Support**
   - Post in team chat
   - Include all gathered information
   - Share reproduction steps

3. **External Resources**
   - Next.js documentation
   - Framer Motion guides
   - TailwindCSS documentation 