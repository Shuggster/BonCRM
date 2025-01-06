# ⚠️ AI INTEGRATION STANDARDS AND CRITICAL WARNINGS

## 🚫 CRITICAL: READ BEFORE ANY AI-RELATED CHANGES

### Strict Rules for All Agents
1. **NO PRODUCTION CHANGES**
   - All AI development MUST stay in `/src/app/(main)/tools/` directory
   - NEVER modify existing authentication system
   - NEVER modify existing database schemas
   - NEVER integrate AI features into production routes

2. **Approved Integration Points**
   - ✅ `/src/app/(main)/tools/shugbot`
   - ✅ `/src/lib/ai/*`
   - ❌ All other directories are OFF LIMITS

3. **Testing Requirements**
   - MUST use `.env.test` for all testing
   - MUST run tests before any changes
   - MUST NOT connect to production databases
   - MUST use test API keys only

## 🏗 Approved Architecture

### Directory Structure
```typescript
src/
  ├── app/
  │   └── (main)/
  │       └── tools/          // ONLY work here
  │           └── shugbot/    // AI assistant implementation
  └── lib/
      └── ai/                 // Core AI functionality
          ├── providers/      // AI service providers
          ├── tests/          // Test files
          └── utils/          // Utilities
```

### Allowed Changes
1. Adding new AI providers in `/src/lib/ai/providers/`
2. Extending ShugBot functionality in `/tools/shugbot/`
3. Adding new AI-related tools in `/tools/`
4. Adding or modifying AI tests

### Forbidden Changes
1. ❌ Modifying authentication system
2. ❌ Changing database schemas
3. ❌ Integrating AI into existing features
4. ❌ Modifying production routes

## 🔒 Security Requirements

1. **API Keys**
   - MUST use test keys for development
   - NEVER commit API keys to repository
   - MUST use environment variables

2. **Testing**
   - MUST maintain separate test database
   - MUST use test credentials
   - MUST verify tests pass before changes

## 📝 Change Process

1. **Before Changes**
   - Read ALL documentation
   - Verify test environment
   - Check current test status

2. **Making Changes**
   - Work ONLY in approved directories
   - Follow existing patterns
   - Keep changes isolated

3. **After Changes**
   - Run ALL tests
   - Document changes
   - Update test coverage

## 🚨 Recovery Process

If you encounter issues:
1. STOP immediately
2. DO NOT attempt fixes outside approved areas
3. Document the issue
4. Wait for human supervisor guidance

## ✅ Verification Checklist

Before ANY changes:
- [ ] Read and understood these guidelines
- [ ] Verified working in test environment
- [ ] Checked current test status
- [ ] Identified approved integration points
- [ ] Reviewed existing AI implementation

## 🤝 Getting Help

If unsure about ANY aspect:
1. STOP work immediately
2. Document your questions
3. Wait for human supervisor guidance
4. DO NOT proceed without clarity

Remember: Safety and stability of the existing system is the TOP priority. 