# UI Standards Guide

## Color Palette

### Primary Colors
- Blue gradient: `from-blue-500 to-blue-400`
- Purple gradient: `from-purple-600 to-purple-400`
- Success gradient: `from-green-600 to-green-400`
- Error gradient: `from-red-600 to-red-400`

### Background Colors
- Main background: `bg-gray-900`
- Card background: `bg-gray-800`
- Hover states: `bg-gray-700`
- Active states: `bg-gray-600`

### Text Colors
- Primary text: `text-white`
- Secondary text: `text-gray-400`
- Muted text: `text-gray-300`

## Typography

### Headings
- Page titles: `text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400`
- Section headings: `text-2xl font-bold text-white`
- Card titles: `text-lg font-medium text-gray-300`

### Body Text
- Primary: `text-sm text-white`
- Secondary: `text-sm text-gray-400`
- Small text: `text-xs text-gray-300`

## Components

### Cards
```jsx
<div className="relative group">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
  <div className="relative bg-gray-900 rounded-lg p-6 ring-1 ring-gray-800/25 shadow-2xl">
    {/* Card content */}
  </div>
</div>
```

### Buttons
```jsx
// Primary Button
<button className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
  Button Text
</button>

// Secondary Button
<button className="px-4 py-2 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-200">
  Button Text
</button>

// Disabled Button
<button className="px-4 py-2 rounded-lg font-medium bg-gray-800 text-gray-400 cursor-not-allowed">
  Button Text
</button>
```

### Navigation Links
```jsx
<Link
  className={`
    relative group flex items-center px-4 py-3 text-sm font-medium rounded-lg
    transition-all duration-200 ease-in-out
    ${isActive 
      ? 'text-white' 
      : 'text-gray-400 hover:text-white'
    }
  `}
>
  {isActive && (
    <motion.div
      layoutId="activeNav"
      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg"
    />
  )}
  {/* Link content */}
</Link>
```

### Form Inputs
```jsx
// Text Input
<input
  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
  type="text"
/>

// Select Input
<select
  className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  <option>Option 1</option>
</select>

// Checkbox
<input
  type="checkbox"
  className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
/>
```

### Status Badges
```jsx
// Success Badge
<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
  Active
</span>

// Warning Badge
<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
  Pending
</span>

// Error Badge
<span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
  Error
</span>
```

### Tables
```jsx
<div className="relative group">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
  <div className="relative overflow-x-auto bg-gray-900 rounded-lg ring-1 ring-gray-800/25 shadow-2xl">
    <table className="w-full text-left">
      <thead className="bg-gray-800/50 text-gray-400 text-sm">
        {/* Table header */}
      </thead>
      <tbody className="divide-y divide-gray-800">
        {/* Table body */}
      </tbody>
    </table>
  </div>
</div>
```

## Layout Guidelines

### Container
```jsx
<div className="container mx-auto px-4 py-8">
  {/* Page content */}
</div>
```

### Grid Layouts
```jsx
// 4-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>

// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Grid items */}
</div>
```

### Flex Layouts
```jsx
// Space between
<div className="flex justify-between items-center">
  {/* Flex items */}
</div>

// Centered
<div className="flex items-center justify-center">
  {/* Flex items */}
</div>
```

## Animation Standards

### Transitions
- Color transitions: `transition-colors duration-200`
- Transform transitions: `transition-transform duration-200`
- All properties: `transition-all duration-200`

### Hover Effects
- Scale: `hover:scale-110`
- Background: `hover:bg-gray-700`
- Opacity: `hover:opacity-100`

### Motion Components
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Animated content */}
</motion.div>
```

## Responsive Design

### Breakpoints
- Mobile: Default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Large Desktop: `xl:` (1280px)

### Mobile-First Approach
Always start with mobile layout and enhance for larger screens:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content adapts to screen size */}
</div>
```

## Accessibility

### Focus States
- All interactive elements should have visible focus states
- Use `focus:ring-2 focus:ring-blue-500 focus:outline-none`

### Color Contrast
- Ensure text has sufficient contrast with backgrounds
- Use opacity for subtle variations while maintaining readability

### Screen Readers
- Include proper ARIA labels
- Use semantic HTML elements
- Provide alt text for images

## Best Practices

1. **Consistency**
   - Use the defined color palette
   - Maintain consistent spacing
   - Follow typography guidelines

2. **Performance**
   - Use CSS classes instead of inline styles
   - Optimize animations for performance
   - Lazy load images and components

3. **Maintainability**
   - Use meaningful class names
   - Follow component composition patterns
   - Document custom components

4. **Responsiveness**
   - Test on multiple devices
   - Use fluid typography
   - Ensure touch targets are adequate size
