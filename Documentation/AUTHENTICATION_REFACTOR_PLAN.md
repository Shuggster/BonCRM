# Authentication Refactor Plan

## Current State Analysis
- NextAuth.js for authentication
- Users stored in Supabase database
- Mixed documentation about Supabase Auth usage
- Working but with user creation issues

## Proposed Architecture
### 1. Authentication Layer
- NextAuth.js as sole authentication provider
- JWT strategy with session management
- No Supabase Auth dependency
- Users table with bcrypt password hashing

### 2. Security Model
- Server-side only database access
- Supabase service role key never exposed to client
- All data operations through validated API routes
- Session-based role verification

### 3. Database Access Pattern
```typescript
// ❌ Never on client
const data = await supabase.from('table').select()

// ✅ Always through API
const data = await fetch('/api/resource').then(r => r.json())
```

## Test Plan

### Phase 1: Proof of Concept
1. Create test endpoint `/api/test/auth-flow` that:
   - Validates session
   - Performs database operation
   - Returns role-specific data

2. Create test component that:
   - Uses NextAuth session
   - Calls test endpoint
   - Displays results based on user role

3. Success Criteria:
   - Unauthorized users cannot access data
   - Different roles see appropriate data
   - Database operations are secure
   - Performance is acceptable

### Phase 2: User Management Test
1. Create temporary user creation endpoint
2. Test full user lifecycle:
   - Creation
   - Authentication
   - Password change
   - Role update
   - Deactivation

3. Success Criteria:
   - Users can be created without errors
   - Login works consistently
   - Password changes are secure
   - Role changes take effect immediately

## Implementation Phases (if tests successful)

### Phase 1: Core Authentication
1. Update auth-options.ts
2. Implement consistent session handling
3. Clean up Supabase Auth references

### Phase 2: API Routes
1. Implement protected route pattern
2. Add role-based access control
3. Add error handling

### Phase 3: Documentation
1. Update all authentication docs
2. Add security guidelines
3. Update disaster recovery procedures

## Rollback Plan
1. Keep current implementation in separate branch
2. Document all changes with before/after states
3. Maintain database backups
4. Keep copy of working auth-options.ts

## Success Metrics
- Zero authentication failures
- Consistent user creation
- Clear error messages
- Improved performance
- Simplified codebase
- Consistent documentation

## Questions to Answer During Testing
1. Session persistence behavior?
2. Token refresh strategy?
3. Error handling patterns?
4. Performance impact?
5. Deployment considerations?

## Security Considerations
- Password hashing implementation
- Session token handling
- Database access patterns
- Role validation
- Error message security
