# Lovable CRM Project Overview

## 🎯 Project Vision
Lovable CRM is a modern, user-friendly customer relationship management system designed to provide a seamless and enjoyable experience for managing customer relationships, tasks, and scheduling.

## 🏗 Technical Stack
- **Frontend**: Next.js 13+ with App Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context
- **Forms**: React Hook Form + Zod

## 📦 Core Features

### 1. Contact Management
- Contact profiles with detailed information
- Tag-based organization
- Activity tracking
- Scheduling system with calendar integration

### 2. Task Management
- Task creation and assignment
- Due date tracking
- Status management
- Task notes and attachments

### 3. Calendar Integration
- Event scheduling
- Meeting management
- Calendar sync
- Activity timeline

### 4. Dashboard
- Recent activities
- Key metrics
- Quick actions
- Performance insights

## 🎨 UI/UX Architecture

### Three-Column Layout
Every page follows our standard three-column layout:

1. **Column 1: Static Navigation**
   - Global navigation
   - Quick actions
   - User settings

2. **Column 2: Main Content**
   - Primary content area
   - List views
   - Search/filter interfaces

3. **Column 3: Split View**
   - Default view (page-specific)
   - Detail view
   - Quick actions

### Animation System
- Page transitions
- Split view animations
- List item animations
- Micro-interactions

## 🔧 Development Standards

### 1. Code Organization
```typescript
src/
  ├── app/              # Next.js app router pages
  ├── components/       # Reusable components
  ├── lib/             # Utilities and helpers
  ├── hooks/           # Custom React hooks
  ├── types/           # TypeScript definitions
  └── styles/          # Global styles
```

### 2. Component Pattern
```typescript
// Standard component structure
export function ComponentName({
  prop1,
  prop2
}: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Derived state
  const computed = useMemo(() => {}, [])
  
  // 3. Effects
  useEffect(() => {}, [])
  
  // 4. Event handlers
  const handleEvent = () => {}
  
  // 5. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### 3. Database Schema
```sql
-- Core tables
contacts (
  id uuid PRIMARY KEY,
  name text,
  email text,
  created_at timestamptz DEFAULT now()
)

tasks (
  id uuid PRIMARY KEY,
  title text,
  status text,
  created_at timestamptz DEFAULT now()
)

calendar_events (
  id uuid PRIMARY KEY,
  title text,
  start_time timestamptz,
  created_at timestamptz DEFAULT now()
)
```

## 🚀 Getting Started

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 2. Key URLs
- Development: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs
- Storybook: http://localhost:6006

### 3. Essential Commands
```bash
# Development
npm run dev         # Start development server
npm run build      # Build production version
npm run lint       # Run linter
npm run test       # Run tests

# Database
npm run db:migrate  # Run migrations
npm run db:seed    # Seed database
```

## 📚 Documentation Structure

```
Documentation/
  ├── 1-getting-started/    # Setup and overview
  ├── 2-core-standards/     # UI and code standards
  ├── 3-implementation/     # Feature guides
  └── 4-maintenance/        # Troubleshooting
```

## 🔄 Development Workflow

### 1. Feature Development
1. Check existing documentation
2. Follow UI/UX standards
3. Implement animations
4. Add tests
5. Update documentation

### 2. Code Review Process
- Follow style guide
- Maintain animation standards
- Ensure accessibility
- Test performance
- Update documentation

### 3. Testing Requirements
- Unit tests for utilities
- Component tests
- Animation testing
- Performance testing
- Accessibility testing

## 🎯 Current Focus
- Implementing new UI patterns
- Enhancing animations
- Improving performance
- Maintaining consistency

## 🤝 Contributing
1. Read all documentation
2. Follow existing patterns
3. Maintain consistency
4. Test thoroughly
5. Update documentation

## 📞 Support
- Documentation: /Documentation
- Issues: GitHub Issues
- Questions: Team Chat 