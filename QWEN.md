# TonStores Catalog Hub - Project Context

## Overview
TonStores Catalog Hub is a modern e-commerce catalog management system built with React, Vite, and Supabase. It enables users to create and share beautiful product catalogs, manage orders, and process payments seamlessly using Monnify integration. The platform also includes admin capabilities for managing users, catalogs, products, orders, and subscriptions.

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **UI Components:** Shadcn/ui + Tailwind CSS + Lucide React
- **Backend:** Supabase (PostgreSQL database with Row Level Security)
- **Payment Processing:** Monnify
- **Email Service:** Resend
- **Hosting:** Vercel
- **Build System:** Vite with TypeScript
- **UI Styling:** Tailwind CSS with CSS variables

## Project Architecture

### Directory Structure
```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── lib/          # Utility functions
├── types/        # TypeScript type definitions
└── styles/       # Global styles and Tailwind config
```

### Key Features
- Product catalog creation and management
- Shopping cart functionality
- Secure payment processing with Monnify
- User authentication with Supabase
- Admin role system for platform management
- Order management with status tracking
- Social media sales tracking
- Email verification and notifications
- Responsive design for all devices
- Automatic order expiration for abandoned payments
- Cloudflare Turnstile integration for spam protection

## Environment Setup

### Prerequisites
- Node.js (v24 or higher as specified in package.json)
- npm or yarn
- Git
- Supabase account
- Monnify account
- Resend account

### Installation
1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Copy `.env.example` to `.env.local` and fill in environment variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Monnify Configuration
   VITE_MONNIFY_API_KEY=your_monnify_api_key
   VITE_MONNIFY_SECRET_KEY=your_monnify_secret_key
   VITE_MONNIFY_CONTRACT_CODE=your_monnify_contract_code

   # Resend Configuration
   VITE_RESEND_API_KEY=your_resend_api_key

   # Site URL (update for production)
   VITE_SITE_URL=http://localhost:5173

   # Cloudflare Turnstile
   VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
   ```

## Development Commands

### Available Scripts
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run process-payouts` - Run payout processing script
- `npm run deploy-functions` - Deploy Supabase functions

### Development Server Configuration
The development server runs on port 3000 and includes:
- Proxy for API requests to avoid CORS issues
- Host configuration to accept connections from any interface

## Deployment Configuration

### Vercel Deployment
The project includes `vercel.json` for easy deployment on Vercel with:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable configuration

### Build Process
The build process involves:
1. Installing dependencies
2. Running TypeScript compilation with skipLibCheck
3. Executing the Vite build process
4. Outputting to the `dist` directory

## Payment Integration

### Monnify Implementation
TonStores integrates with Monnify for payment processing with the following features:
- KYC onboarding for sellers
- Automatic subaccount creation for direct payments
- White-label payment experience
- Automated payouts to seller bank accounts
- Multiple payment options (cards, bank transfers, USSD)
- Real-time payment status updates

### Order Status Handling
- **Paid:** When a payment is successful
- **Cancelled:** When a user deliberately cancels a payment
- **Failed:** When a payment operation fails due to technical issues or declined cards
- **Pending:** Default state before payment completion

### Automatic Order Expiration
Pending orders automatically expire after 30 minutes if payment isn't completed:
- Updates both `status` and `payment_status` fields to 'failed'
- Adds a note explaining the automatic expiration
- Implemented at the database level using PostgreSQL triggers

## Admin Role System

### Admin Capabilities
Administrators have comprehensive platform management capabilities:
- View and manage all user profiles
- View and manage all catalogs (including inactive ones)
- View and manage all products
- View and manage all orders
- View and manage all subscriptions
- View and manage contact submissions
- Access system-wide analytics and statistics
- Promote/demote users to/from admin status

### Implementation
- Database role column in the `profiles` table (enum: 'user', 'admin')
- Row-Level Security (RLS) policies using `is_admin()` SQL function
- Edge Functions for role management
- Admin-specific frontend services and interfaces

## Database Integration

### Supabase Configuration
- Authentication system with email verification
- Row-Level Security (RLS) policies for data protection
- Storage for user avatars and profile images
- Database functions for admin role checks
- Functions for processing payouts and managing orders

### Social Media Sales Tracking
- Source tracking during checkout
- Analytics dashboard showing sales revenue by platform
- Visual reports with bar charts showing platform performance

## Authentication System

### Overview
The application uses Supabase for user authentication, including registration, login, email verification, and password recovery.

### Features
- User registration with email verification
- Secure login with password
- Password recovery system
- Email verification workflow
- Integration with Cloudflare Turnstile for bot protection

### Password Recovery Implementation
- Dedicated password recovery page (`/auth/recovery`)
- Update password page (`/auth/update-password`)
- Email-based password reset flow
- Secure password update after authentication
- Integration with Supabase's built-in password reset functionality

## Event Tracking System

### Overview
The application includes a comprehensive event tracking system that stores behavioral data in the Supabase database.

### Architecture
- Client-side tracking utility (`eventTracker.ts`) with functions for tracking various event types
- Supabase Edge Function (`/supabase/functions/track-event`) to handle event recording
- Event data stored in the `events` table with Row Level Security (RLS)
- Automatic page view tracking when added to the main App component
- Privacy-conscious design (only tracks keys, not values, for form submissions)

### Edge Function Implementation
The event tracking system uses a Supabase Edge Function to bypass Row Level Security policies and properly handle events from both authenticated users and guest users. This function:
- Accepts event data via authenticated or unauthenticated requests
- Supports guest user identification via custom headers
- Records events in the database using the service role key
- Includes proper CORS and security headers

### Event Types
Common events tracked include:
- Product interactions (viewed, added to cart)
- Payment events (initiated, completed, failed)
- Order events (created, completed)
- Subscription events
- KYC verification events
- User authentication events
- UI interactions (button clicks, form submissions)
- Error occurrences

### Database Schema
- `events` table with columns: id, user_id, session_id, event_type, event_data (JSONB), source, created_at
- Row Level Security (RLS) policies to restrict access to user's own events
- Indexes for performance optimization

### Implementation
- `eventTracker.ts` utility with functions for tracking various event types
- React hooks in `useEventTracker.ts` for easy integration in components
- Automatic page view tracking when added to the main App component
- Privacy-conscious design (only tracks keys, not values, for form submissions)

### Event Types
Common events tracked include:
- Product interactions (viewed, added to cart)
- Payment events (initiated, completed, failed)
- Order events (created, completed)
- Subscription events
- KYC verification events
- User authentication events
- UI interactions (button clicks, form submissions)
- Error occurrences

### Privacy Considerations
- RLS policies ensure users can only access their own events
- Sensitive data is not stored in event_data
- Development mode has optional event tracking to prevent excessive data generation

## Email Service Integration

### Resend Implementation
- Verification emails for account confirmation
- Password reset functionality
- Fallback system using Supabase's built-in email service
- Custom HTML email templates

### Configuration
1. Set up Resend account and verify domain
2. Generate API key
3. Configure environment variable: `VITE_RESEND_API_KEY`

## Security Features

### Cloudflare Turnstile
- Spam protection for forms
- Bot prevention
- Configuration required in environment variables: `VITE_TURNSTILE_SITE_KEY`

### CORS and Security Headers
- Configured in Supabase functions for API routes
- Security headers for all routes (X-Frame-Options, X-XSS-Protection, etc.)
- Cache control for static assets

## Testing and Quality Assurance

### Code Quality Tools
- ESLint for code linting
- TypeScript for type checking
- Prettier for code formatting
- Tailwind CSS for consistent styling

## Troubleshooting

### Common Issues
1. **Supabase Signup 500 Errors:** Check `emailRedirectTo` configuration and use service role key
2. **Monnify Subaccount Creation:** Verify API keys and bank information format
3. **Order Status Updates:** Ensure RLS policies are correctly applied
4. **Supabase Functions:** Check function logs for processing errors

### Environment Variables
Ensure all required environment variables are correctly set for development and production.

## File Structure Summary
- `package.json`: Dependencies and scripts
- `vite.config.ts`: Vite build configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `vercel.json`: Vercel deployment settings
- `components.json`: Shadcn/ui component configuration
- `tsconfig.*.json`: TypeScript configuration files
- `index.html`: Main HTML entry point
- `build.mjs`: Custom build script

## API Integration

### Backend Services
- Supabase for database and authentication
- Monnify for payment processing
- Resend for email delivery
- Supabase Functions for server-side logic

### API Redirects
Supabase configuration handles API redirects to appropriate serverless functions, including payment processing, subaccount creation, bank verification, and payout processing.

## Frontend Architecture

### React Components
- Shadcn/ui components with Radix UI primitives
- Custom UI components with Tailwind CSS
- Responsive design using mobile-first approach
- Accessibility-focused implementation
- Reusable component library pattern

### State Management
- React hooks for local state
- TanStack Query for server state
- Supabase client for authentication and database operations
- Context API for global state when needed

This comprehensive overview provides the context needed for working with the TonStores project, including all key features, configuration requirements, and development workflow considerations.