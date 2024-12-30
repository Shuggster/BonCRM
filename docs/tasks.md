# Tasks Implementation Guide

## Getting Started

### 1. Initial File Structure
```
src/
├── components/
│   └── tasks/
│       └── new/
│           ├── Tasks.tsx       # Main tasks container
│           ├── TaskList.tsx    # List component
│           ├── TaskView.tsx    # Split view component
│           ├── TaskFormContext.tsx  # Form state management
│           └── SimpleTaskForm.tsx   # Task form component
└── types/
    └── tasks.ts               # TypeScript types
```

### 2. Database Schema
```sql
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    task_group_id UUID REFERENCES task_groups(id),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
CREATE POLICY "Users can manage their own tasks"
ON tasks FOR ALL
TO authenticated
USING (user_id = auth.uid());
```

### 3. TypeScript Types
```typescript
export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  task_group_id: string | null
  user_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  task_groups?: {
    id: string
    name: string
    color: string
  }
}
```

## Component Standards

### Card Styling
All task cards should follow these styling rules:
```typescript
// Base card container
<div 
  className="relative rounded-xl overflow-hidden backdrop-blur-[16px]"
  style={{ 
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
  }}
>
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>

// Card sections
<div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
  {/* Section content */}
</div>
```

### Status Colors
```typescript
const statusColors = {
  'completed': 'bg-green-500/20 text-green-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  'todo': 'bg-orange-500/20 text-orange-400'
}
```

### Priority Colors
```typescript
const priorityColors = {
  'high': 'bg-red-500/20 text-red-400',
  'medium': 'bg-orange-500/20 text-orange-400',
  'low': 'bg-green-500/20 text-green-400'
}
```

## Split View Implementation

### 1. Task View Structure
The task view is split into two sections:

**Upper Section:**
- Task title and icon
- Status and priority cards
- Task details (description, due date, assignment, group)
- Edit functionality

**Lower Section:**
- Activity timeline
- Comments section
- Task history

### 2. Animation Standards
Split view animations should use these exact parameters:

```typescript
// Container animations
const containerVariants = {
  initial: { opacity: 0, x: "100%" },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 1.2,
      ease: [0.32, 0.72, 0, 1]
    }
  }
}

// Split view animations
const splitViewVariants = {
  upper: {
    initial: { y: "-100%" },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  },
  lower: {
    initial: { y: "100%" },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  }
}
```

## Required Dependencies
```json
{
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "latest",
    "@supabase/supabase-js": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest"
  }
}
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
