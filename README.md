# Tonstores Catalog Hub

A modern e-commerce catalog management system built with React, Vite, and Supabase. Create and share beautiful product catalogs, manage orders, and process payments seamlessly.

## Features

- 🛍️ Create and manage product catalogs
- 💰 Process payments with Paystack
- 📱 Responsive design for all devices
- 🔐 Secure authentication with Supabase
- 🛒 Shopping cart functionality
- 📊 Order management
- 🔗 Shareable catalog links
- 📧 Email verification and password reset with Resend
- 🔐 Admin role system for platform management
- 🏦 KYC onboarding and direct payments to sellers
- 📊 Social media sales tracking
- 👤 User authentication with Supabase's built-in authentication

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL with Row Level Security)
- **Payment Processing:** Paystack
- **Email Service:** Resend
- **Hosting:** Vercel
- **Build System:** Vite with TypeScript
- **UI Styling:** Tailwind CSS with CSS variables

## Getting Started

### Prerequisites

- Node.js (v24 or higher as specified in package.json)
- npm or yarn
- Git
- Supabase account
- Paystack account
- Resend account

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

     # Paystack Configuration
     VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
     VITE_PAYSTACK_SECRET_KEY=your_paystack_secret_key


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

## Migration from Custom Guest System to Supabase Anonymous Authentication

This project was originally built with a custom guest ID system that used localStorage and custom session parameters. We have successfully migrated to use Supabase's built-in anonymous authentication, which provides the following improvements:

### Migrated Functionality

1. **Anonymous User Support**: Users can now browse and place orders without creating an account using Supabase's native anonymous authentication
2. **Session Management**: Supabase handles session persistence, refresh, and storage automatically
3. **User ID Management**: Anonymous users get a proper user ID that persists across sessions
4. **Simplified RLS Policies**: Updated to use `auth.uid()` instead of custom guest session parameters
5. **Removed Complex Interceptors**: Eliminated fetch interceptors that were blocking Supabase requests
6. **Improved Performance**: No more session parameter management overhead

### Key Changes

- **No more custom guest ID system**: Removed localStorage-based guest ID generation
- **No more session parameter functions**: Eliminated `set_app_guest_id` functions and related database functions
- **Simplified authentication flow**: Supabase handles everything automatically
- **Better security**: Built-in Supabase authentication instead of custom implementation
- **Improved reliability**: No more timeout issues due to fetch interceptors

### Database Schema Updates

- Removed `is_guest_order` and `guest_id` columns from the `orders` table
- Added `placed_as_guest` column to track if order was placed while anonymous
- Updated RLS policies to use `auth.uid()` instead of custom guest parameters
- Removed `set_app_guest_id` and related functions
- Removed guest-specific indexes and policies

### Frontend Changes

- Updated authentication flow to use `signInAnonymously()` instead of custom guest ID generation
- Simplified order creation to work with Supabase's built-in user ID
- Removed fetch interceptors that were causing timeout issues
- Updated payment processing to work with anonymous users
- Enhanced profile loading to work with both anonymous and authenticated users

## Migration from Monnify to Paystack

This project was originally built with Monnify as the payment provider. We have successfully migrated to Paystack with the following changes:

### Migrated Functionality

1. **Payment Processing**: All payment flows now use Paystack instead of Monnify
2. **Subaccount Management**: Sellers can now create Paystack subaccounts for direct payments
3. **Bank Verification**: Account verification functionality now uses Paystack API
4. **Customer Verification**: KYC and customer verification now integrated with Paystack
5. **Payout Management**: Automated payouts to seller bank accounts via Paystack

### Supabase Edge Functions Created

The following Paystack-specific functions were created during the migration:

- `paystack-subaccount`: Creates Paystack subaccounts for sellers
- `paystack-banks`: Fetches list of supported banks from Paystack
- `paystack-verify-account`: Verifies bank accounts using Paystack
- `paystack-customer-verification`: Handles customer KYC verification
- `paystack-initialize-transaction`: Initializes payment transactions
- `paystack-initialize-escrow-transaction`: Initializes escrow transactions
- `paystack-seller-balance`: Retrieves seller balance from Paystack
- `paystack-ledger-history`: Fetches seller's transaction history
- `paystack-payout-history`: Retrieves payout history
- `paystack-process-payout`: Processes payouts to sellers
- `paystack-release-escrow-funds`: Releases escrow funds when needed
- `paystack-transaction-receipt`: Generates transaction receipts
- `paystack-verify-transaction`: Verifies transaction status
- `paystack-webhook`: Handles Paystack webhooks

### Database Schema Updates

- Added Paystack-specific fields to the `profiles` table
- Updated payment processing logic to use Paystack transaction references
- Enhanced order management to track Paystack-specific status updates
- Added automatic order expiration for abandoned payments

### Frontend Changes

- Updated payment components to use Paystack integration
- Modified KYC onboarding flow for Paystack requirements
- Enhanced order management UI for Paystack status tracking
- Updated payout management for Paystack processing

## Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack public key |
| `VITE_PAYSTACK_SECRET_KEY` | Your Paystack secret key |
| `VITE_RESEND_API_KEY` | Your Resend API key |
| `VITE_SITE_URL` | Your site URL |
| `VITE_TURNSTILE_SITE_KEY` | Your Cloudflare Turnstile site key |

To obtain these variables:

1. **Supabase Configuration:**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the project settings
   - **Important**: Enable anonymous sign-ins in your Supabase dashboard under Authentication > Settings

2. **Paystack Configuration:**
   - Sign up at [paystack.com](https://paystack.com)
   - Get your API keys from the dashboard under Settings > API Keys & Webhooks

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
- `npm run process-payouts` - Run payout processing script
- `npm run deploy-functions` - Deploy Supabase functions

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

### Deploying Supabase Functions

To deploy the Paystack functions to your Supabase project:

```bash
npx supabase functions deploy --use-api
```

If you encounter import errors during deployment, use the `--allow-import` flag:

```bash
npx supabase functions deploy --use-api --allow-import
```

## Payment Integration

Tonstores integrates with Paystack to provide a seamless payment experience for both sellers and buyers:

### For Sellers:
- **KYC Onboarding**: Secure collection of identification and bank details
- **Subaccount Creation**: Automatic setup of Paystack subaccounts for direct payments
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

## Order Status Handling

We've improved order status handling to properly track payment statuses:

- **Paid**: When a payment is successful
- **Cancelled**: When a user deliberately cancels a payment
- **Failed**: When a payment operation fails due to technical issues or declined cards
- **Pending**: Default state before payment is completed

## Automatic Order Expiration

The platform automatically expires pending orders after 30 minutes to handle cases where users abandon the payment process. This feature:

1. Updates both `status` and `payment_status` fields to 'failed'
2. Adds a note to the order explaining the automatic expiration
3. Is implemented at the database level using PostgreSQL triggers and functions
4. Displays a countdown timer in the order management UI

This helps keep the order system clean and provides clear feedback to merchants about the status of pending orders.

## Social Media Sales Tracking

This feature allows sellers to track which social media platforms are driving their sales. It includes:

1. **Source Tracking**: Customers can indicate which social media platform referred them during checkout
2. **Analytics Dashboard**: View sales and revenue breakdown by social media platform
3. **Visual Reports**: Bar charts showing the performance of different platforms

The social media source data will start collecting as soon as customers begin making purchases through your store.

## Security Features

### Cloudflare Turnstile
- Spam protection for forms
- Bot prevention
- Configuration required in environment variables: `VITE_TURNSTILE_SITE_KEY`

### CORS and Security Headers
- Configured in Supabase functions for API routes
- Security headers for all routes (X-Frame-Options, X-XSS-Protection, etc.)
- Cache control for static assets

## Deployment

1. Set up your environment variables in your hosting platform
2. Push your changes to GitHub
3. Deploy using Vercel or your preferred hosting service

The project includes a `vercel.json` file for easy deployment on Vercel.

## Troubleshooting

### Common Issues
1. **Supabase Signup 500 Errors:** Check `emailRedirectTo` configuration and use service role key
2. **Paystack Subaccount Creation:** Verify API keys and bank information format
3. **Order Status Updates:** Ensure RLS policies are correctly applied
4. **Supabase Functions:** Check function logs for processing errors
5. **Authentication Issues:** Ensure anonymous sign-ins are enabled in your Supabase dashboard

### Function Deployment Issues
If you encounter import errors during function deployment:
- Use the `--allow-import` flag when deploying
- Check that all required dependencies are available via Deno.land or esm.sh
- Verify that your Supabase project has the necessary permissions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues with the Paystack integration or other functionality, please check:
- The troubleshooting section above
- The Supabase function logs in your Supabase dashboard
- The browser console for any errors during development

For additional support, you can open an issue in the repository or contact the development team.