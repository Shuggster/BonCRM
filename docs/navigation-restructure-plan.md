# Navigation and Layout Restructuring Plan

## Current Issues
1. Navigation menu not showing up on pages
2. Missing logout functionality
3. Route group confusion (multiple overlapping groups)
4. Admin pages accessibility and protection
5. Inconsistent layout application

## Current Structure
```
src/app/
├── (admin)/*      - Admin-specific pages
├── (app)/*        - Main application pages
├── (auth)/*       - Authentication pages
├── (main)/*       - Additional main pages
└── Various direct routes (dashboard, contacts, etc.)
```

## Proposed Structure
```
src/app/
├── (auth)/           # Authentication routes
│   ├── login/       # Login page
│   ├── register/    # Registration if needed
│   └── layout.tsx   # Auth-specific layout
│
├── (app)/            # Protected application routes
│   ├── dashboard/   # Dashboard page
│   ├── contacts/    # Contacts page
│   ├── tasks/       # Tasks page
│   ├── calendar/    # Calendar page
│   ├── messages/    # Messages page
│   ├── reports/     # Reports page
│   └── layout.tsx   # Main app layout with header & sidebar
│
└── (admin)/          # Protected admin routes
    ├── users/       # User management
    ├── roles/       # Role management
    ├── settings/    # System settings
    └── layout.tsx   # Admin-specific layout
```

## Implementation Plan

### Phase 1: Fix Authentication Components
1. Verify SessionProvider implementation
2. Add logout button to header component
3. Test authentication flow
4. Ensure proper session handling

### Phase 2: Consolidate Layouts
1. Update root layout
   - Remove unnecessary code
   - Keep only essential providers
2. Streamline auth layout
   - Focus on login page functionality
3. Enhance app layout
   - Add header with logout
   - Include sidebar with navigation
4. Refine admin layout
   - Add role-based protection
   - Maintain consistent styling

### Phase 3: Route Reorganization
1. Move all main application pages under (app)
2. Consolidate admin pages under (admin)
3. Clean up duplicate or unused routes
4. Update all navigation links

### Phase 4: Navigation Implementation
1. Update sidebar component
   - Implement proper routing
   - Add active state handling
2. Add admin section to sidebar
   - Show only for admin users
   - Include proper links
3. Test navigation flow
4. Ensure mobile responsiveness

### Phase 5: Testing & Verification
1. Test authentication flows
   - Login
   - Logout
   - Session persistence
2. Verify route protection
   - Public routes
   - Protected routes
   - Admin routes
3. Test navigation
   - All links working
   - Proper active states
   - Mobile functionality
4. Cross-browser testing

## Implementation Notes
- Make incremental changes
- Test each phase before proceeding
- Maintain existing functionality
- Keep consistent styling
- Document all changes

## Success Criteria
1. All pages accessible through navigation
2. Working logout functionality
3. Protected routes working correctly
4. Admin section only visible to admins
5. Consistent layout across all pages
6. Mobile-friendly navigation
7. No regression in existing features

## Rollback Plan
1. Commit changes at each phase
2. Document all modified files
3. Keep backup of critical components
4. Test rollback procedures

## Next Steps
1. Review and approve plan
2. Begin with Phase 1
3. Test thoroughly after each phase
4. Document any deviations from plan
