# Lovable CRM Component Library

## Core Components

### PageHeader
The standard page header used across all main views.

```tsx
<PageHeader
  title="Dashboard"
  description="Overview of your CRM activities."
  icon={<LayoutDashboard className="h-6 w-6" />}
/>

// Styling
.page-header {
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.page-header__icon {
  background: rgba(59,130,246,0.1);
  padding: 0.5rem;
  border-radius: 0.75rem;
  color: rgb(59,130,246);
}
```

### Card
Base card component with variants.

```tsx
// Standard Card
<Card className="rounded-xl p-6 bg-card hover:bg-card/80 transition-colors">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Dashboard Metric Card
<Card className="dashboard-card relative overflow-hidden">
  <div className="card-gradient absolute inset-0 opacity-10" />
  <CardHeader>
    <CardTitle>{metric.name}</CardTitle>
    <CardValue>{metric.value}</CardValue>
  </CardHeader>
</Card>
```

### Modal
Standard modal component used across the application.

```tsx
<Dialog>
  <DialogContent className="max-w-[90vw] md:max-w-[85vw] bg-[#0F1629] text-white border-white/10">
    <DialogHeader className="px-8 py-6 border-b border-white/10">
      <DialogTitle className="text-xl font-medium">
        {title}
      </DialogTitle>
      <DialogDescription>
        {description}
      </DialogDescription>
    </DialogHeader>
    <div className="p-8">
      {/* Modal content */}
    </div>
    <DialogFooter className="px-8 py-6 border-t border-white/10">
      {/* Actions */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components

#### Input
```tsx
<div className="space-y-2">
  <Label>Field Label</Label>
  <Input 
    className="w-full px-3 py-2 bg-[#1C2333] rounded border border-white/10 focus:border-blue-500"
    placeholder="Enter value..."
  />
  <Description className="text-sm text-muted-foreground">
    Helper text
  </Description>
</div>
```

#### Select
```tsx
<Select
  onValueChange={handleChange}
  defaultValue={defaultValue}
>
  <SelectTrigger className="w-full bg-[#1C2333] border-white/10 focus:border-blue-500 h-10">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent className="bg-[#0F1629] border-white/10">
    <SelectGroup>
      <SelectLabel>Group Label</SelectLabel>
      <SelectItem value="option">Option</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

#### Button
```tsx
// Primary Button
<Button className="bg-blue-600 hover:bg-blue-700 text-white">
  Primary Action
</Button>

// Secondary Button
<Button variant="secondary" className="bg-gray-600 hover:bg-gray-700 text-white">
  Secondary Action
</Button>

// Destructive Button
<Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
  Delete
</Button>
```

### Data Display

#### Table
```tsx
<div className="rounded-xl border border-white/10 overflow-hidden">
  <table className="w-full">
    <thead className="bg-[#1C2333]">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-medium text-white/70">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      <tr className="hover:bg-white/5">
        <td className="px-6 py-4">
          Content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### List
```tsx
<ul className="space-y-2">
  <li className="p-4 rounded-lg bg-card hover:bg-card/80 transition-colors">
    <div className="flex items-center justify-between">
      <span>List Item</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  </li>
</ul>
```

## Animation Patterns

### Page Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Page content */}
</motion.div>
```

### Loading States
```tsx
// Skeleton Loading
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-white/10 rounded w-3/4" />
  <div className="h-4 bg-white/10 rounded w-1/2" />
</div>

// Spinner
<div className="flex items-center justify-center">
  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
    {/* Spinner SVG */}
  </svg>
</div>
```

## Layout Patterns

### Grid Layouts
```tsx
// Dashboard Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
  {/* Grid items */}
</div>

// Card Grid
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Responsive Patterns
```tsx
// Responsive Container
<div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Responsive Stack
<div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
  <div className="w-full lg:w-2/3">
    {/* Main content */}
  </div>
  <div className="w-full lg:w-1/3">
    {/* Sidebar */}
  </div>
</div>
```

## Usage Guidelines

### Component Hierarchy
1. Layout components (containers, grids)
2. UI components (cards, modals)
3. Form components (inputs, buttons)
4. Display components (tables, lists)

### Best Practices
1. **Consistency**
   - Use standard spacing values
   - Follow color system
   - Maintain typography scale
   - Use defined animation patterns

2. **Accessibility**
   - Include proper ARIA labels
   - Maintain keyboard navigation
   - Use semantic HTML
   - Ensure proper contrast

3. **Performance**
   - Lazy load components when possible
   - Use proper memo patterns
   - Optimize animations
   - Monitor render performance

4. **Responsive Design**
   - Mobile-first approach
   - Use standard breakpoints
   - Test on multiple devices
   - Consider touch interactions

### Implementation Examples

#### Dashboard Card
```tsx
<Card className="dashboard-card col-span-3">
  <CardHeader>
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Form Layout
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Label>First Name</Label>
      <Input />
    </div>
    <div className="space-y-2">
      <Label>Last Name</Label>
      <Input />
    </div>
  </div>
  <div className="flex justify-end gap-4">
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
``` 