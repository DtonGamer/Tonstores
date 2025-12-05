# Project Summary

## Overall Goal
Migrate the TonStores e-commerce platform from Netlify functions to Supabase Edge Functions, implement a comprehensive event tracking system, add password recovery functionality, and ensure proper guest user session handling.

## Key Knowledge

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS + Lucide React
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Payment Processing**: Monnify
- **Email Service**: Resend
- **Hosting**: Netlify (with Supabase Edge Functions)

### Architecture Decisions
- Supabase functions are called directly via `supabaseUrl/functions/v1/{functionName}` rather than going through Netlify redirects
- Guest users are handled with custom headers (`X-Guest-ID`) and session parameters
- Event tracking bypasses RLS policies using a dedicated Edge Function with service role key
- Development event tracking is disabled by default (requires `VITE_ENABLE_EVENT_TRACKING=true`)

### Important Files & Conventions
- Supabase Edge Functions in `/supabase/functions/`
- Frontend utilities in `/src/utils/`
- Event tracking system in `/src/utils/eventTracker.ts`
- Guest session system in `/src/utils/sessionParams.ts`
- Authentication state managed in `/src/contexts/AuthContext.tsx`

### Build Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production

### Database Schema
- Events table for tracking user behavior with RLS policies
- Guest session handling via custom headers and session parameters
- Migration from Paystack to Monnify for payment processing

## Recent Actions

### [DONE] Migration to Supabase Functions
- Updated all frontend components to call Supabase functions directly instead of using Netlify API routes
- Created `supabaseFunctions.ts` utility for consistent function calling
- Updated KYCForm and SubscriptionDialog to use new function calls
- Created SQL migration to remove Paystack columns and add Monnify columns

### [DONE] Event Tracking System Implementation
- Created `events` table with RLS policies
- Implemented comprehensive event tracking utilities in `eventTracker.ts`
- Added React hooks for event tracking in `useEventTracker.ts`
- Created dedicated Supabase Edge Function for event tracking to handle RLS issues
- Integrated automatic page view tracking in App component
- Added tracking to KYC form and authentication flows

### [DONE] Password Recovery System
- Created `PasswordRecovery.tsx` component for initiating password reset
- Created `UpdatePassword.tsx` component for setting new password
- Added routes for `/auth/recovery` and `/auth/update-password`
- Added "Forgot your password?" link to login form
- Integrated with Supabase's built-in password reset functionality
- Added event tracking for password recovery flow

### [DONE] Guest User Session Handling
- Enhanced existing guest session system to work with event tracking
- Implemented proper handling of guest ID in headers for all database operations
- Updated RLS policies to work with guest session approach

### [DONE] Auth Event Tracking
- Added event tracking to AuthContext for login, signup, and logout
- Enhanced error tracking throughout auth flows
- Updated documentation to reflect new authentication system

## Current Plan

### [DONE] Password Recovery Implementation
- [x] Create password recovery page
- [x] Create password update page
- [x] Add routes to App component
- [x] Add link to login form
- [x] Integrate with Supabase auth
- [x] Add event tracking

### [DONE] Event Tracking System
- [x] Create events table with RLS policies
- [x] Implement event tracking utilities
- [x] Create React hooks for event tracking
- [x] Create Supabase Edge Function to handle RLS issues
- [x] Integrate with existing components
- [x] Document the system

### [DONE] Migration to Supabase Functions
- [x] Update frontend to call Supabase functions directly
- [x] Remove Netlify redirect dependencies
- [x] Update all function calls in components
- [x] Create utility for consistent function calls

### [DONE] Guest Session Integration
- [x] Ensure event tracking works with guest users
- [x] Update RLS policies to support guest sessions
- [x] Test guest session handling with new tracking system

### [TODO] Production Deployment
- [ ] Deploy Supabase Edge Functions with `--no-verify-jwt` for public endpoints
- [ ] Test event tracking in production environment
- [ ] Verify password recovery flow in production

### [TODO] Further Testing
- [ ] Test event tracking for all user types (guest, authenticated, admin)
- [ ] Verify RLS policies work correctly for all event types
- [ ] Ensure guest user sessions persist properly across application states

---

## Summary Metadata
**Update time**: 2025-12-05T11:52:15.549Z 
