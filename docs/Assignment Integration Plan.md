# Assignment Integration Plan

## Current Implementation Insights

### User Assignment System
1. **Database Structure**
   - `users` table:
     - Key fields: `id`, `email`, `name`, `role`, `department`, `is_active`
     - Department and active status are crucial for assignment filtering
   - `team_members` table:
     - Links users to teams: `team_id`, `user_id`, `role`, `joined_at`

2. **TeamSelect Component**
   - Core reusable component for user/team assignments
   - Features:
     - Department-based filtering
     - Active user filtering
     - Cross-department assignments for admins
     - Visual separation of name and department in dropdowns
     - Support for both user and team assignments

3. **Assignment Rules**
   - Regular users can only assign within their department
   - Admins can assign across departments
   - Only active users are shown in selection
   - Teams are filtered by department
   - Department information is passed with assignments

4. **Implementation Pattern**
   ```typescript
   // Component Props
   interface TeamSelectProps {
     onSelect: (selection: { 
       type: 'user' | 'team', 
       id: string, 
       department?: string 
     }) => void
     currentDepartment?: string
     allowCrossDepartment?: boolean
   }
   ```

### Current Progress
1. ✅ Tasks Module Integration
   - Fully implemented with department validation
   - User/team assignment working
   - Activity logging for assignments

2. 🔄 Calendar Module (In Progress)
   - Schema updated
   - Types defined
   - UI components pending update

3. 🔄 Contacts Module (In Progress)
   - Schema updated
   - Types defined
   - UI components pending update

## Implementation Plan

### Phase 1: Database Updates (Completed)
- [x] Add assignment fields to calendar_events
- [x] Add assignment fields to contacts
- [x] Create necessary foreign key constraints

### Phase 2: Type System Updates (In Progress)
- [x] Update CalendarEvent interface
- [x] Update Contact interface
- [ ] Add validation types for assignments

### Phase 3: UI Component Updates
- [x] Implement TeamSelect improvements
- [ ] Update Calendar event modal
- [ ] Update Contact form
- [ ] Add department validation to both modules

### Phase 4: Service Layer Updates
- [ ] Update calendar service
- [ ] Update contacts service
- [ ] Add department validation logic

### Phase 5: Testing
- [ ] Test regular user assignments (department-restricted)
- [ ] Test admin user assignments (cross-department)
- [ ] Test team assignments
- [ ] Verify department validation
- [ ] Test error handling

## Rollback Plan
- Backup of original files maintained in `backups/pre_assignment_integration`
- Database rollback scripts for schema changes
- Type system can be reverted to previous commit

## Notes
- Keep department validation consistent across modules
- Maintain activity logging for all assignment changes
- Consider bulk assignment features for future updates 