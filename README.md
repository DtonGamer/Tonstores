# Tonstores Catalog Hub

A modern e-commerce catalog management system built with React, Vite, and Supabase. Create and share beautiful product catalogs, manage orders, and process payments seamlessly.

## Features

- 🛍️ Create and manage product catalogs
- 💰 Process payments with Monnify
- 📱 Responsive design for all devices
- 🔐 Secure authentication with Supabase
- 🛒 Shopping cart functionality
- 📊 Order management
- 🔗 Shareable catalog links
- 📧 Email verification and password reset with Resend

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Backend:** Supabase
- **Payment Processing:** Monnify
- **Email Service:** Resend
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Tonstores-catalog-hub.git
cd Tonstores-catalog-hub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   - Fill in your environment variables:
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

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_MONNIFY_API_KEY` | Your Monnify API key |
| `VITE_MONNIFY_SECRET_KEY` | Your Monnify secret key |
| `VITE_MONNIFY_CONTRACT_CODE` | Your Monnify contract code |
| `VITE_RESEND_API_KEY` | Your Resend API key |
| `VITE_TURNSTILE_SITE_KEY` | Your Cloudflare Turnstile site key |

To obtain these variables:

1. **Supabase Configuration:**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the project settings

2. **Monnify Configuration:**
   - Sign up at [monnify.com](https://monnify.com)
   - Get your API keys from the dashboard under the Developers section
   - Find your contract code in the dashboard

3. **Resend Configuration:**
   - Sign up at [resend.com](https://resend.com)
   - Create an API key in your dashboard
   - Configure your domain for sending emails

4. **Cloudflare Turnstile Configuration:**
   - Sign up at [Cloudflare](https://www.cloudflare.com/)
   - Create a Turnstile site key in your dashboard
   - Add your domain(s) to the allowed domains list
   - For local development, add `localhost` to the domain allowlist

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── lib/          # Utility functions
├── types/        # TypeScript type definitions
└── styles/       # Global styles and Tailwind config
```

## Deployment

1. Set up your environment variables in your hosting platform
2. Push your changes to GitHub
3. Deploy using Vercel or your preferred hosting service

The project includes a `vercel.json` file for easy deployment on Vercel.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Admin Role System

The Tonstores Catalog Hub implements a comprehensive Admin Role system that allows designated administrators to manage the platform.

### Admin Capabilities

Administrators have the following capabilities:

- View and manage all user profiles
- View and manage all catalogs (even inactive ones)
- View and manage all products
- View and manage all orders
- View and manage all subscriptions
- View and manage contact submissions
- Access system-wide analytics and statistics
- Promote/demote users to/from admin status

### Technical Implementation

The admin role system is implemented through:

1. **Database Schema**:
   - A `role` column in the `profiles` table (enum: 'user', 'admin')
   - Default value is 'user' for new accounts

2. **Row-Level Security (RLS) Policies**:
   - Admin-specific policies for all tables
   - Uses the new `is_admin()` SQL function

3. **Edge Functions**:
   - `/update-user-role` - For promoting/demoting users (admin only)

4. **Helper Functions**:
   - `is_admin()` SQL function for policy checks
   - `getAdminProfile()` utility for retrieving admin defaults

5. **Frontend Integration**:
   - Admin service for role management
   - Admin-specific views and interfaces

### Using the Admin Features

To use admin features, a user account must have the 'admin' role. Currently only database administrators can set the first admin account; afterward, admins can promote other users through the admin interface.

### Fallback Logic

The system implements a fallback pattern where:
1. User-specific values are used if available
2. Admin default values are used if user values are missing
3. Hardcoded defaults are used as a last resort

This applies to contact methods, payment settings, and other configurable values.

## Payment Integration

Tonstores integrates with Monnify to provide a seamless payment experience for both sellers and buyers:

### For Sellers:
- **KYC Onboarding**: Secure collection of identification and bank details
- **Subaccount Creation**: Automatic setup of Monnify subaccounts for direct payments
- **White-Label Experience**: Branded payment flow without exposing third-party services
- **Automated Payouts**: Regular transfers to seller bank accounts with transparent fee structure
- **Payment Dashboard**: Real-time tracking of sales, balance, and payout history

### For Buyers:
- **Seamless Checkout**: Integrated payment experience within the Tonstores platform
- **Multiple Payment Options**: Support for cards, bank transfers, and USSD
- **Secure Transactions**: PCI-compliant payment processing

### Technical Implementation:
- **Supabase Edge Functions**: Serverless functions for subaccount creation, payouts, and balance tracking
- **Automated Payout Engine**: Scheduled cron job for processing seller payouts
- **Webhook Integration**: Real-time updates on payment status changes

For detailed documentation, see [docs/payment-integration.md](docs/payment-integration.md).

## Email Service

Tonstores integrates with Resend to provide reliable email delivery for:

### Email Features
- **Verification Emails**: Secure account verification process
- **Password Reset**: Self-service password recovery
- **Fallback System**: Uses Supabase's built-in email service first, with Resend as a fallback
- **Custom Templates**: Professionally designed email templates

### Setting Up Email Service
1. **Configure Resend**:
   - Set up a Resend account at [resend.com](https://resend.com)
   - Verify your domain ownership
   - Generate an API key

2. **Configure Supabase**:
   - In your Supabase dashboard, navigate to Authentication > Email Templates
   - Customize the email templates to match your branding

3. **Environment Variables**:
   - Add your Resend API key to your `.env` file:
     ```
     VITE_RESEND_API_KEY=your_resend_api_key
     ```

### Technical Implementation
- **Email Service**: Abstracted email operations through a dedicated service
- **Fallback Logic**: Gracefully handles rate limits and service outages
- **Custom Templates**: HTML email templates for all notification types

For detailed documentation, see [docs/email-service.md](docs/email-service.md).

# Environment Setup

Copy the `.env.example` to `.env.local` and fill in the following required environment variables:

```
# Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Monnify API keys
VITE_MONNIFY_API_KEY=your_monnify_api_key
VITE_MONNIFY_SECRET_KEY=your_monnify_secret_key
VITE_MONNIFY_CONTRACT_CODE=your_monnify_contract_code

# Email service
VITE_RESEND_API_KEY=your_resend_api_key

# Site URL (update for production)
VITE_SITE_URL=http://localhost:5173

# Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
```

## Authentication Troubleshooting

If you encounter 500 errors in the Supabase signup flow, check:

1. **Supabase Auto-Email Conflict**: Make sure your code sets `emailRedirectTo` correctly to avoid rate-limiting from both systems trying to send emails.

2. **Admin Privileges for Email**: Use the service role key with the `supabaseAdmin` client for sending verification emails.

3. **Verification Link Format**: Ensure verification emails point to the correct endpoint and include proper tokens.

## Monnify Subaccount Troubleshooting

If subaccounts aren't being created in your Monnify account:

1. **API Key**: Verify your Monnify API keys are correctly set in `.env.local`.

2. **API Response**: Check browser console for detailed error messages from the Monnify API.

3. **Bank Information**: Make sure the bank code, account number, and other details match Monnify's requirements.

4. **Network Issues**: Confirm there are no CORS or network connectivity problems with the Monnify API.

# Tonstores Payment Integration

This project implements Monnify payment integration for Tonstores, with robust order status handling for different payment outcomes.

## Implementation Changes

### Order Status Handling

We've improved order status handling to properly track payment statuses:

- **Paid**: When a payment is successful
- **Cancelled**: When a user deliberately cancels a payment
- **Failed**: When a payment operation fails due to technical issues or declined cards
- **Pending**: Default state before payment is completed

### Key Files Modified

1. `supabase/functions/monnify-webhook/index.ts` - Updated to use Supabase Edge Functions instead of Next.js API routes
2. `src/hooks/useMonnifyPayment.ts` - Added robust order status handling
3. `src/pages/Checkout.tsx` - Improved payment flow and status handling
4. `sql/orders_rls_policy.sql` - Added RLS policies to allow order status updates

## Database Setup

To properly handle order status updates, run the following SQL in your Supabase SQL Editor:

```sql
-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Allow order status updates" ON orders;

-- Create policy to allow order status updates for all orders
CREATE POLICY "Allow order status updates"
ON orders
FOR UPDATE 
USING (true)  -- Allow for all orders
WITH CHECK (
  -- Only allow updating these specific fields
  (
    NEW.status IN ('pending', 'paid', 'cancelled', 'failed') AND
    NEW.payment_status IN ('pending', 'paid', 'cancelled', 'failed')
  )
);

-- Create order status logs table if needed
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  previous_status VARCHAR NOT NULL,
  new_status VARCHAR NOT NULL,
  previous_payment_status VARCHAR NOT NULL,
  new_payment_status VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Installation

Make sure to install the required dependencies:

```bash
npm install @netlify/functions raw-body crypto
```

## Building and Deployment

Run the build command:

```bash
npm run build
```

## Troubleshooting

If you encounter issues with order status updates:

1. Check Supabase RLS policies are correctly applied
2. Verify network requests in browser console for any errors
3. Check Netlify function logs for webhook processing errors
4. Ensure all required environment variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `MONNIFY_SECRET_KEY`
   - `RESEND_API_KEY` (for email notifications)

## Automatic Order Expiration

The platform automatically expires pending orders after 30 minutes to handle cases where users abandon the payment process. This feature:

1. Updates both `status` and `payment_status` fields to 'failed'
2. Adds a note to the order explaining the automatic expiration
3. Is implemented at the database level using PostgreSQL triggers and functions
4. Displays a countdown timer in the order management UI

This helps keep the order system clean and provides clear feedback to merchants about the status of pending orders.

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server with `npm run dev`

## Database Migrations

The database migrations are located in the `supabase/migrations` directory. To apply them:

1. Connect to your Supabase project
2. Run the migrations using the Supabase CLI or dashboard

## License

MIT

## New Features

### Social Media Sales Tracking

This feature allows sellers to track which social media platforms are driving their sales. It includes:

1. **Source Tracking**: Customers can indicate which social media platform referred them during checkout
2. **Analytics Dashboard**: View sales and revenue breakdown by social media platform
3. **Visual Reports**: Bar charts showing the performance of different platforms

To activate this feature:

1. Apply the migration: `npx supabase migration up`
2. Restart your application

 I've created both a shell script (deploy_supabase_functions.sh) and a Windows batch file
  (deploy_supabase_functions.bat) to deploy these functions. To deploy:

The social media source data will start collecting as soon as customers begin making purchases through your store.
