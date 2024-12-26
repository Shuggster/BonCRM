# Troubleshooting Guide

## Quick Reference
Common issues and their immediate solutions:

### Hydration Issues

#### Split View Hydration Error
**Symptoms:**
- Error: "Hydration failed because the server rendered HTML didn't match the client"
- Split view content flashing on page load
- Content disappearing after refresh

**Quick Fix:**
1. Check that `SplitViewContainer` is only rendered once in the layout
2. Ensure localStorage is only accessed on the client side
3. Use the `SplitViewPersistence` component for state restoration

```typescript
// ✅ Correct implementation in layout.tsx
<div className="flex h-screen">
  <Sidebar />
  <main>{children}</main>
  <div className="w-[800px]">
    <SplitViewContainer />
    <SplitViewPersistence />
  </div>
</div>

// ❌ Common mistakes
- Multiple SplitViewContainer instances
- Accessing localStorage during SSR
- Missing SplitViewPersistence component
```

**Prevention:**
1. Always initialize store with default values
2. Use client-side effects for persistence
3. Keep split view in the main layout

**Time to Fix: 5-10 minutes**

### Animation Issues

#### Split View Not Animating
**Symptoms:**
- Third column appears without animation
- Animation stutters or jumps
- Content flashes or disappears

**Quick Fix:**
1. Check the sequence in your click handler:
```typescript
// ✅ Correct order
const handleClick = () => {
  const newContent = prepareContent(item);
  setSelectedItem(item);
  setContent(newContent, item.id);
  show();
}
```

2. If using `hide()`, ensure it's only called when transitioning away, not before new content is ready.

**Time to Fix: < 5 minutes**

For detailed animation standards, see: `docs/ANIMATION_STANDARDS.md`

## Database Issues 