# InnovAIte Application Architecture Guide

## Project Structure
```
src/
├── components/        # Reusable UI components
│   ├── admin/        # Admin-specific components
│   └── common/       # Shared components
├── context/          # React context providers
├── pages/            # Page components
│   ├── admin/        # Admin pages
│   └── demos/        # Demo pages
├── config/           # Configuration files
├── utils/            # Utility functions
└── styles/           # Global styles
```

## Authentication & Authorization

### Auth Flow
1. Authentication is handled by Supabase Auth
2. User states are managed through `AuthContext` (`src/context/AuthContext.jsx`)
3. Protected routes use wrapper components in `App.jsx`:
   - `ProtectedRoute`: For logged-in users only
   - `AdminRoute`: For admin users only

### Admin Access
- Admin status is determined by email (hugh@bonnymans.co.uk)
- Admin routes are protected by `AdminRoute` wrapper
- Admin UI components are in `src/components/admin/`

## Database Connection

### Supabase Setup
- Connection configured in `src/config/supabase.js`
- Environment variables required:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

### Database Tables
- `public.profiles`: User profile information
- `auth.users`: Managed by Supabase Auth

## Component Guidelines

### Creating New Components
1. Place in appropriate directory:
   - Reusable components → `src/components/`
   - Page components → `src/pages/`
   - Admin components → `src/components/admin/`

2. Protected Routes:
   ```jsx
   <Route
     path="/your-path"
     element={
       <ProtectedRoute message="Custom message for non-logged in users">
         <YourComponent />
       </ProtectedRoute>
     }
   />
   ```

3. Admin Routes:
   ```jsx
   <Route
     path="/admin/your-path"
     element={
       <AdminRoute>
         <YourAdminComponent />
       </AdminRoute>
     }
   />
   ```

### Context Usage
```jsx
import { useAuth } from '../context/AuthContext';

function YourComponent() {
  const { user, isAdmin } = useAuth();
  // Use user.isAdmin for admin-specific features
}
```

## Common Patterns

### Protected Content
```jsx
function YourComponent() {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      {/* Public content */}
      {user && (
        // Logged-in user content
      )}
      {isAdmin && (
        // Admin-only content
      )}
    </div>
  );
}
```

### Error Handling
```jsx
try {
  // Database operations
  const { data, error } = await supabase.from('your_table').select();
  if (error) throw error;
} catch (error) {
  toast.error(error.message);
}
```

## Important Notes

1. **File Structure**
   - Keep AdminDashboard.jsx in `src/pages/admin/`
   - Keep Users.jsx in `src/pages/admin/`
   - Don't move core layout files

2. **Authentication**
   - Always use AuthContext for user state
   - Don't bypass protected routes
   - Use toast notifications for auth messages

3. **State Management**
   - Use React Context for global state
   - Keep component state local when possible

4. **Routing**
   - Define routes in App.jsx
   - Use appropriate route wrappers
   - Include informative messages for redirects

## Common Gotchas

1. **Auth Redirects**
   - Always use `Navigate` component with `replace`
   - Include helpful messages in state

2. **Admin Access**
   - Check `isAdmin` from AuthContext
   - Don't rely on role property

3. **Component Imports**
   - Use correct relative paths
   - Maintain existing file structure

4. **Protected Routes**
   - Always wrap sensitive routes
   - Include user-friendly messages

Remember: Keep it simple! Don't move files around unless absolutely necessary. The current structure works well - just add new components in their appropriate directories.
