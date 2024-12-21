# Assignment Integration Plan

## Overview
This document outlines the plan for extending the assignment functionality from the Tasks module to both Calendar and Contacts modules. The goal is to maintain consistency across all modules while ensuring proper data validation and user experience.

## Database Structure
### Users Table
- id (uuid)
- email (text)
- name (text)
- role (text)
- department (text) - management, sales, accounts, trade_shop
- is_active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)

### Team Members Table
- team_id (uuid)
- user_id (uuid)
- role (text) - leader, member
- joined_at (timestamptz)

### Teams Table
- id (uuid)
- name (text)
- description (text)
- department (text)
- created_by (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)

## Assignment Rules
1. Users can only be assigned to items within their department
2. Team assignments must match the department of the team
3. Team leaders have additional permissions within their team's scope
4. Department-based visibility rules apply to all assignments
5. Active status of users must be checked before assignment

## Current State
- Tasks module has working assignment functionality with:
  - User/Team assignment
  - Department tracking
  - Activity logging for assignment changes
  - TeamSelect component integration

## Phase 1: Database Schema Updates
- [x] Add assignment fields to calendar_events table
  - assigned_to (UUID) REFERENCES users(id)
  - assigned_to_type (TEXT) CHECK (assigned_to_type IN ('user', 'team'))
  - department (TEXT) CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop'))
- [x] Add assignment fields to contacts table
  - assigned_to (UUID) REFERENCES users(id)
  - assigned_to_type (TEXT) CHECK (assigned_to_type IN ('user', 'team'))
  - department (TEXT) CHECK (department IN ('management', 'sales', 'accounts', 'trade_shop'))
- [x] Add foreign key constraints
- [x] Update database types

## Phase 2: Type System Updates
### Calendar Module
- [x] Update CalendarEvent interface
- [x] Update CalendarEventRow type
- [ ] Fix type mismatches in calendar service
  - Handle null vs undefined
  - Fix RecurrenceRule type issues
- [ ] Add activity tracking types for assignments
- [ ] Add department validation types

### Contacts Module
- [x] Update Contact interface
- [ ] Create ContactActivity type for logging
- [ ] Update contact service types
- [ ] Fix component prop type mismatches
- [ ] Add department validation types

## Phase 3: UI Component Updates
### Calendar Module
- [x] Add TeamSelect to EventModal
- [ ] Add department validation to TeamSelect
- [ ] Add assignment display in calendar views
- [ ] Update event card to show assignment
- [ ] Add assignment filters
- [ ] Add department-based visibility

### Contacts Module
- [ ] Add TeamSelect to contact creation/edit forms
- [ ] Add department validation to TeamSelect
- [ ] Update contact cards to show assignment
- [ ] Add assignment-based filtering
- [ ] Update contact details view
- [ ] Add department-based visibility

## Phase 4: Service Layer Updates
### Calendar Module
- [ ] Update calendar service CRUD operations
- [ ] Add department validation
- [ ] Add assignment activity logging
- [ ] Add assignment-based queries
- [ ] Update event recurrence handling
- [ ] Implement permission checks

### Contacts Module
- [ ] Update contact service CRUD operations
- [ ] Add department validation
- [ ] Add assignment activity logging
- [ ] Add assignment-based queries
- [ ] Update bulk operations
- [ ] Implement permission checks

## Phase 5: Testing Plan
### Unit Tests
- [ ] Test TeamSelect component with departments
- [ ] Test assignment validation rules
- [ ] Test type conversions
- [ ] Test activity logging
- [ ] Test permission checks

### Integration Tests
- [ ] Test calendar assignment workflow
- [ ] Test contact assignment workflow
- [ ] Test cross-module assignment consistency
- [ ] Test bulk operations
- [ ] Test department-based rules

### UI Tests
- [ ] Test assignment UI flows
- [ ] Test error handling
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Test department visibility rules

## Phase 6: Documentation Updates
- [ ] Update API documentation
- [ ] Update component documentation
- [ ] Add assignment-related examples
- [ ] Update database schema documentation
- [ ] Document department-based rules

## Implementation Order
1. Fix existing type errors in calendar service
2. Add department validation to TeamSelect
3. Complete calendar UI integration
4. Add calendar assignment activity logging
5. Update contacts creation/edit forms
6. Add contacts assignment display
7. Implement contacts activity logging
8. Add filtering and search capabilities
9. Implement permission checks
10. Update documentation

## Testing Strategy
- Test each phase independently
- Create test cases before implementation
- Validate both success and error paths
- Test edge cases and null/undefined handling
- Verify activity logging accuracy
- Test department-based permissions

## Rollback Plan
- Keep SQL scripts for reverting schema changes
- Maintain type compatibility with existing code
- Document all breaking changes
- Create backup points at each phase