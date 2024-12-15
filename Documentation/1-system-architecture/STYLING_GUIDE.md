# Styling Guide

## Theme Configuration

### Color Palette
```css
:root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
}
```

## Component Styles

### Navigation
```css
/* Sidebar Navigation */
.sidebar-nav {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    backdrop-filter: blur(12px);
}

.nav-item {
    position: relative;
    transition: all 0.3s ease;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.06);
}
```

### Cards
```css
/* Dashboard Cards */
.card {
    @apply rounded-xl border bg-card text-card-foreground shadow;
}

.card-tasks {
    background: linear-gradient(145deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05));
}

.card-leads {
    background: linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
}
```

## Typography

### Font Configuration
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

### Text Styles
```css
/* Headings */
h1 {
    @apply text-2xl font-bold tracking-tight;
}

h2 {
    @apply text-xl font-semibold;
}

h3 {
    @apply text-lg font-medium;
}

/* Body Text */
.text-body {
    @apply text-sm text-muted-foreground;
}
```

## Layout Components

### Container
```css
.container {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}
```

### Grid System
```css
.grid-layout {
    @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3;
}
```

## Form Elements

### Inputs
```css
.input {
    @apply rounded-md border border-input bg-background px-3 py-2 text-sm;
    @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
}
```

### Buttons
```css
.btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
    @apply inline-flex items-center justify-center rounded-md px-4 py-2;
    @apply text-sm font-medium transition-colors focus-visible:outline-none;
}

.btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}

.btn-destructive {
    @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
}
```

## Animation

### Transitions
```css
.transition-default {
    @apply transition-all duration-200 ease-in-out;
}

.transition-slow {
    @apply transition-all duration-300 ease-in-out;
}
```

### Hover Effects
```css
.hover-effect {
    @apply hover:scale-105 transition-transform duration-200;
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) {
    /* sm */
}

@media (min-width: 768px) {
    /* md */
}

@media (min-width: 1024px) {
    /* lg */
}

@media (min-width: 1280px) {
    /* xl */
}
```

## Dark Mode

### Base Styles
```css
.dark {
    color-scheme: dark;
}

@layer base {
    body {
        @apply bg-background text-foreground;
        font-feature-settings: "rlig" 1, "calt" 1;
    }
}
```

## Usage Guidelines

1. **Component Creation**
   - Use Tailwind classes
   - Follow dark theme compatibility
   - Maintain consistent spacing

2. **Accessibility**
   - Maintain color contrast
   - Use semantic HTML
   - Include focus states

3. **Best Practices**
   - Use utility classes
   - Follow mobile-first approach
   - Maintain consistent spacing
   - Use CSS variables for theme values
