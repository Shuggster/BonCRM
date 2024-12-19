# Lovable CRM Documentation

## Core Documentation
1. **[PRE_SESSION.md](./PRE_SESSION.md)**
   - First-time setup guide
   - Project overview
   - Critical guidelines

2. **[DISASTER-RECOVERY.md](./DISASTER-RECOVERY.md)**
   - System architecture
   - Authentication flow
   - Recovery procedures
   - Troubleshooting guide

3. **[COMPONENT_STRUCTURE.md](./1-system-architecture/COMPONENT_STRUCTURE.md)**
   - UI component organization
   - Component hierarchy
   - Reusable components

4. **[STYLING_GUIDE.md](./1-system-architecture/STYLING_GUIDE.md)**
   - UI design principles
   - Theme configuration
   - Component styling

## Before Making Changes
1. Read PRE_SESSION.md for project overview
2. Study DISASTER-RECOVERY.md for system architecture
3. Follow component and styling guides for UI changes

## Important Notes
- All write operations MUST use server endpoints
- NextAuth handles authentication
- Supabase is used primarily as a database
- RLS is intentionally disabled for simplicity

## Project Structure
