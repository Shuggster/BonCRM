# ⚠️ CRITICAL: AI IMPLEMENTATION GUIDELINES

## 🚫 STOP AND READ FIRST
Before making ANY changes to AI implementation:
1. Read `/Documentation/2-core-standards/AI_INTEGRATION_STANDARDS.md`
2. Verify you are working in test environment
3. Confirm you understand the approved integration points

## 🎯 Approved Work Areas
- ✅ This directory (`/src/lib/ai/*`)
- ✅ `/src/app/(main)/tools/shugbot/*`
- ❌ ALL other directories are OFF LIMITS

## 🔒 Current Status
- AI features are isolated to tools section
- ShugBot is the primary integration point
- All changes must be tested in isolation
- NO integration with production systems

## ⚡ Quick Reference
1. NEVER modify auth system
2. NEVER change database schemas
3. NEVER integrate outside tools section
4. ALWAYS use test environment
5. ALWAYS run tests before changes

## 🆘 Need Help?
1. Stop work immediately
2. Document your questions
3. Wait for human supervisor guidance

See full guidelines in `/Documentation/2-core-standards/AI_INTEGRATION_STANDARDS.md` 