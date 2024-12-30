# Testing Standards

## Overview
Our testing strategy ensures code quality and reliability through multiple testing layers:

1. Unit Tests (Jest)
2. Component Tests (React Testing Library)
3. E2E Tests (Playwright)
4. Accessibility Tests (axe-core)
5. Performance Tests (Lighthouse)

## Unit Testing

### Utilities and Hooks
```typescript
// Example utility test
describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-01T12:00:00')
    expect(formatDate(date)).toBe('Jan 1, 12:00 PM')
  })
})

// Example hook test
describe('useForm', () => {
  it('handles form submission', async () => {
    const { result } = renderHook(() => useForm())
    
    act(() => {
      result.current.handleSubmit()
    })
    
    expect(result.current.isSubmitting).toBe(true)
  })
})
```

## Component Testing

### Form Components
```typescript
describe('NewContactForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = jest.fn()
    render(<NewContactForm onSubmit={onSubmit} />)
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText(/first name/i),
      'John'
    )
    
    // Submit form
    await userEvent.click(screen.getByRole('button', {
      name: /save contact/i
    }))
    
    // Verify submission
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: 'John'
    })
  })
  
  it('displays validation errors', async () => {
    render(<NewContactForm />)
    
    // Submit empty form
    await userEvent.click(screen.getByRole('button', {
      name: /save contact/i
    }))
    
    // Verify error message
    expect(screen.getByText(/first name is required/i))
      .toBeInTheDocument()
  })
})
```

### Animation Testing
```typescript
describe('SplitView', () => {
  it('animates on mount', async () => {
    render(<SplitView />)
    
    // Check initial state
    expect(screen.getByTestId('upper-card'))
      .toHaveStyle({ transform: 'translateY(-100%)' })
    
    // Wait for animation
    await waitFor(() => {
      expect(screen.getByTestId('upper-card'))
        .toHaveStyle({ transform: 'translateY(0)' })
    })
  })
})
```

## E2E Testing

### Critical Paths
```typescript
test('create new contact flow', async ({ page }) => {
  await page.goto('/')
  
  // Open new contact form
  await page.click('button:has-text("New Contact")')
  
  // Fill form
  await page.fill('[name="firstName"]', 'John')
  await page.fill('[name="lastName"]', 'Doe')
  
  // Submit form
  await page.click('button:has-text("Save Contact")')
  
  // Verify success
  await expect(page.getByText('Contact created')).toBeVisible()
})
```

## Accessibility Testing

### Component Level
```typescript
describe('Input', () => {
  it('meets accessibility standards', async () => {
    const { container } = render(
      <Input label="Email" name="email" />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Page Level
```typescript
test('dashboard page is accessible', async ({ page }) => {
  await page.goto('/dashboard')
  
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toHaveLength(0)
})
```

## Performance Testing

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.example.com/
          budgetPath: ./.github/lighthouse/budget.json
          uploadArtifacts: true
```

### Performance Budgets
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["warn", {"minScore": 0.9}],
        "interactive": ["error", {"minScore": 0.9}],
        "performance": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

## Test Coverage Requirements

### Minimum Coverage
- Unit Tests: 80%
- Component Tests: 70%
- E2E Tests: Critical paths only
- Accessibility: Zero violations
- Performance: Score > 90

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View detailed report
npm run test:coverage:report
```

## Best Practices

1. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Mock external dependencies
   - Use MSW for API mocking
   - Avoid excessive mocking

3. **Test Data**
   - Use factories for test data
   - Avoid hardcoded values
   - Clean up after tests

4. **Continuous Integration**
   - Run all tests on CI
   - Enforce coverage thresholds
   - Block merges on test failures 