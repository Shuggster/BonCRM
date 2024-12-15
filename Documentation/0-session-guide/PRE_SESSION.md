# Pre-Session Guide for Lovable CRM

## Project Overview
Lovable CRM is a modern, user-friendly customer relationship management system built for Bonnymans. The system uses Next.js 14, Supabase, and Tailwind CSS with a dark theme design.

## Current Status
- Basic CRM functionality implemented
- Working on user management and authentication
- Navigation structure in place
- Database schema established

## Key Components
1. **Frontend**: Next.js 14 with App Router
2. **Backend**: Supabase with RLS policies
3. **Authentication**: NextAuth.js
4. **Styling**: Tailwind CSS with custom dark theme

## Current Focus
1. User Management System
2. Role-Based Access Control
3. Personalized Dashboards
4. Data Security

## Project Structure
```
src/
├── app/
│   ├── (auth)/     # Authentication routes
│   ├── (main)/     # Main application routes
│   └── (app)/      # Admin features
├── components/      # Reusable components
├── lib/            # Utility functions
└── styles/         # Global styles
```

## Database Schema
- Users
- Contacts
- Industries
- Tags
- Scheduled Activities
- Notes

## Environment
- Development Port: 3001
- Node.js
- TypeScript
- Supabase

## Current Priorities
1. Implementing role-based authentication
2. Creating personalized dashboards
3. Securing routes based on user roles
4. Maintaining clean navigation structure

## Key Files to Reference
- `src/app/(auth)/lib/auth-options.ts`
- `src/app/(main)/layout.tsx`
- `src/app/globals.css`
- `Documentation/README.md`
