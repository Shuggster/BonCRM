# Authentication Setup Guide

## Development Environment

### Supabase Settings
1. **Email Authentication**
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Email Provider
   - Uncheck "Confirm email" for development ease
   - Uncheck "Secure email change" for development

### Rate Limiting
The application implements client-side rate limiting with different settings for development and production:
- Development: 10 attempts per 15 minutes
- Production: 3 attempts per hour

## Production Environment

### Supabase Settings
1. **Email Authentication**
   - Enable Email Provider
   - Check "Confirm email" for security
   - Check "Secure email change" for security
   - Set appropriate redirect URLs

2. **Rate Limiting**
   - Email rate limits are handled by Supabase
   - Additional client-side rate limiting is implemented
   - Customize `src/config/auth.js` for production values

### Security Considerations
1. **Email Verification**
   - Required in production
   - Prevents unauthorized signups
   - Ensures valid email addresses

2. **Rate Limiting**
   - Prevents abuse and spam
   - IP-based limits by Supabase
   - Additional client-side protection

## Configuration Files
- `src/config/auth.js`: Environment-specific settings
- `src/components/Auth.jsx`: Implementation of auth flow
- `supabase/migrations/`: Database setup and policies

## Deployment Checklist
1. [ ] Enable email confirmation in Supabase
2. [ ] Configure production redirect URLs
3. [ ] Review and adjust rate limit settings
4. [ ] Test email delivery in production
5. [ ] Verify profile creation trigger works
6. [ ] Check all security policies are active

## Troubleshooting
1. **Rate Limit Issues**
   - Check client-side rate limit settings
   - Verify Supabase rate limit configuration
   - Monitor failed signup attempts

2. **Profile Creation**
   - Check database trigger is active
   - Verify RLS policies are correct
   - Monitor profile creation errors

3. **Email Issues**
   - Verify SMTP settings in Supabase
   - Check email templates
   - Test email delivery

## Development Tips
1. Use email aliases (e.g., `email+test1@domain.com`) for multiple test accounts
2. Clear localStorage to reset rate limit counters
3. Monitor Supabase logs for auth issues
