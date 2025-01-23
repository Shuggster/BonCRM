# Component Guide

## Component Types

### 1. Page Components
Located in `src/pages/`:
```jsx
// pages/About.jsx
export default function About() {
  return (
    <div className="container mx-auto p-4">
      <h1>About Us</h1>
      {/* Content */}
    </div>
  );
}
```

### 2. Protected Pages
```jsx
// pages/Profile.jsx
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <h1>Welcome {user.email}</h1>
      {/* Protected content */}
    </div>
  );
}
```

### 3. Admin Pages
```jsx
// pages/admin/Users.jsx
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) return null;

  return (
    <div className="container mx-auto p-4">
      <h1>User Management</h1>
      {/* Admin content */}
    </div>
  );
}
```

## Adding New Components

### 1. Basic Component Template
```jsx
import React from 'react';

export default function NewComponent() {
  return (
    <div className="container mx-auto p-4">
      {/* Your content */}
    </div>
  );
}
```

### 2. Protected Component Template
```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedComponent() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace state={{ 
      message: "Please sign in to access this feature" 
    }} />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Protected content */}
    </div>
  );
}
```

### 3. Admin Component Template
```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminComponent() {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Admin content */}
    </div>
  );
}
```

## Routing

### 1. Adding Routes
In `App.jsx`:
```jsx
<Routes>
  {/* Public Route */}
  <Route path="/about" element={<About />} />

  {/* Protected Route */}
  <Route 
    path="/profile" 
    element={
      <ProtectedRoute message="Please sign in to view your profile">
        <Profile />
      </ProtectedRoute>
    } 
  />

  {/* Admin Route */}
  <Route 
    path="/admin/*" 
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    } 
  />
</Routes>
```

## Best Practices

### 1. Component Organization
```
src/
├── components/
│   ├── common/          # Shared components
│   ├── admin/           # Admin components
│   └── layout/          # Layout components
└── pages/
    ├── admin/           # Admin pages
    └── demos/           # Demo pages
```

### 2. Authentication
```jsx
// DON'T do this ❌
if (user.email === 'admin@example.com') {
  // Show admin content
}

// DO this ✅
const { isAdmin } = useAuth();
if (isAdmin) {
  // Show admin content
}
```

### 3. Error Handling
```jsx
// DON'T do this ❌
const data = await fetchData();
setData(data);

// DO this ✅
try {
  const { data, error } = await fetchData();
  if (error) throw error;
  setData(data);
} catch (error) {
  toast.error('Failed to fetch data');
  console.error(error);
}
```

## Common Patterns

### 1. Loading States
```jsx
export default function YourComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        // Your content
      )}
    </div>
  );
}
```

### 2. Error States
```jsx
export default function YourComponent() {
  const [error, setError] = useState(null);

  return (
    <div>
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      // Your content
    </div>
  );
}
```

### 3. Form Handling
```jsx
export default function YourForm() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Handle submission
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Need Help?

1. Check existing components for patterns
2. Follow the file structure
3. Use the templates provided
4. When in doubt, ask for help!
