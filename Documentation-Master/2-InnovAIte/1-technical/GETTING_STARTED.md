# Getting Started with InnovAIte

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Supabase account
4. Git

## Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Fill in your Supabase credentials in `.env`

## Project Structure

Our project follows a clear structure:

```
src/
├── components/        # UI components
├── pages/            # Page components
├── context/          # React contexts
├── config/           # Configuration
└── utils/            # Utilities
```

### Key Files You'll Work With

- `src/App.jsx` - Main application routes
- `src/context/AuthContext.jsx` - User authentication
- `src/components/Header.jsx` - Navigation header
- `src/pages/` - Add new pages here

## Development Workflow

1. **Starting the Development Server**
   ```bash
   npm run dev
   ```

2. **Creating New Components**
   - Place in appropriate directory
   - Follow existing naming conventions
   - Use provided templates (see below)

3. **Adding New Routes**
   - Add route in `App.jsx`
   - Use protection wrappers if needed
   - Follow existing route patterns

## Component Templates

### Basic Component
```jsx
import React from 'react';

export default function YourComponent() {
  return (
    <div className="container mx-auto p-4">
      {/* Your content */}
    </div>
  );
}
```

### Protected Component
```jsx
import { useAuth } from '../context/AuthContext';

export default function ProtectedComponent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      {/* Protected content */}
    </div>
  );
}
```

## DO's and DON'Ts

### DO ✅
- Use existing components when possible
- Follow the established file structure
- Use AuthContext for user state
- Add comments for complex logic

### DON'T ❌
- Move existing files around
- Bypass authentication checks
- Modify core layout components
- Change established patterns

## Common Issues

1. **Authentication Not Working?**
   - Check AuthContext is properly imported
   - Verify protected route wrapper
   - Confirm Supabase credentials

2. **Components Not Showing?**
   - Check import paths
   - Verify route definition
   - Check protection level

3. **Styles Not Applying?**
   - Use Tailwind classes
   - Follow existing style patterns
   - Check class names

## Need More Help?

Check our other guides:
- [Authentication Guide](./AUTHENTICATION.md)
- [Database Guide](./DATABASE.md)
- [Components Guide](./COMPONENTS.md)
- [Architecture Guide](./ARCHITECTURE.md)
