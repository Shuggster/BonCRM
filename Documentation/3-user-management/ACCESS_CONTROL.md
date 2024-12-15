# Access Control Matrix

## Role-Based Access Control (RBAC)

### User Roles Overview

| Feature/Access          | Admin | Senior Management | Department Manager | Operational |
|------------------------|-------|-------------------|-------------------|-------------|
| **User Management**    |       |                   |                   |             |
| Create Users           | ✓     | -                 | -                 | -           |
| View All Users         | ✓     | ✓                 | Dept Only         | -           |
| Edit Users            | ✓     | -                 | -                 | -           |
| Delete Users          | ✓     | -                 | -                 | -           |
| **Contacts**          |       |                   |                   |             |
| Create Contacts       | ✓     | ✓                 | ✓                 | ✓           |
| View All Contacts     | ✓     | ✓                 | Dept Only         | Own Only    |
| Edit Contacts         | ✓     | ✓                 | Dept Only         | Own Only    |
| Delete Contacts       | ✓     | ✓                 | Dept Only         | -           |
| **Tasks**             |       |                   |                   |             |
| Create Tasks          | ✓     | ✓                 | ✓                 | ✓           |
| View All Tasks        | ✓     | ✓                 | Dept Only         | Own Only    |
| Edit Tasks           | ✓     | ✓                 | Dept Only         | Own Only    |
| Delete Tasks         | ✓     | ✓                 | Dept Only         | Own Only    |
| **Reports**           |       |                   |                   |             |
| View All Reports      | ✓     | ✓                 | Dept Only         | Basic Only  |
| Create Reports        | ✓     | ✓                 | Dept Only         | -           |
| Export Data          | ✓     | ✓                 | Dept Only         | -           |
| **Settings**          |       |                   |                   |             |
| System Settings       | ✓     | -                 | -                 | -           |
| Department Settings   | ✓     | ✓                 | Dept Only         | -           |
| Personal Settings     | ✓     | ✓                 | ✓                 | ✓           |

## Department Access Control

### Department Hierarchy
```
Senior Management
└── Department Manager
    └── Operational Staff
```

### Department Data Access

| Role                | Own Dept | Other Depts | All Depts |
|--------------------|----------|-------------|-----------|
| Admin              | ✓        | ✓           | ✓         |
| Senior Management  | ✓        | ✓           | ✓         |
| Department Manager | ✓        | -           | -         |
| Operational        | ✓        | -           | -         |

## Feature Access by Role

### Admin
- Full system access
- User management
- System configuration
- All reports and analytics
- Cross-department access

### Senior Management
- Cross-department view
- Advanced reporting
- Team performance metrics
- Resource allocation

### Department Manager
- Department dashboard
- Team management
- Department reports
- Resource scheduling

### Operational
- Personal dashboard
- Assigned tasks
- Own contacts
- Basic reporting

## Implementation Notes

### 1. Database Level
```sql
-- Example RLS Policy for Contacts
CREATE POLICY "department_access" ON contacts
    USING (
        -- Admin sees all
        (auth.jwt()->>'role' = 'admin')
        OR
        -- Senior Management sees all
        (auth.jwt()->>'role' = 'senior_management')
        OR
        -- Department Manager sees department
        (
            auth.jwt()->>'role' = 'department_manager'
            AND department = current_user_department()
        )
        OR
        -- Operational sees own
        (
            auth.jwt()->>'role' = 'operational'
            AND created_by = auth.uid()
        )
    );
```

### 2. Application Level
```typescript
// Middleware check
export function checkAccess(
    requiredRole: Role,
    resource: string
): boolean {
    const userRole = getCurrentUserRole();
    return hasPermission(userRole, requiredRole, resource);
}
```

### 3. UI Level
```typescript
// Component visibility
function FeatureButton({ feature }: { feature: string }) {
    const { role } = useUser();
    if (!hasAccess(role, feature)) return null;
    return <Button>Access Feature</Button>;
}
```

## Security Considerations

### 1. Authentication
- JWT token validation
- Session management
- Secure password policies

### 2. Authorization
- Role validation
- Resource access checks
- Department boundaries

### 3. Audit Trail
- Access logging
- Change tracking
- Security events

## Testing Scenarios

### 1. Role-Based Tests
```typescript
describe('Access Control', () => {
    test('Admin can access all features')
    test('Department Manager restricted to department')
    test('Operational user restricted to own data')
})
```

### 2. Cross-Department Tests
```typescript
describe('Department Access', () => {
    test('Senior Management can view all departments')
    test('Department Manager restricted to own department')
    test('Operational cannot access other departments')
})
```

## Maintenance

### 1. Regular Reviews
- Access patterns
- Role assignments
- Security incidents

### 2. Updates
- New features
- Role modifications
- Permission adjustments

### 3. Monitoring
- Access attempts
- Permission denials
- System usage
