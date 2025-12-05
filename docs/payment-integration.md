# TonStores Paystack Payment Integration

This document explains the implementation of the Paystack payment integration for TonStores, enabling sellers to receive payments directly to their bank accounts.

## Architecture Overview

The payment integration follows a white-label approach with the following components:

1. **Seller KYC & Onboarding**: Secure collection of seller identification and bank details
2. **Subaccount Setup**: Creation of Paystack subaccounts for each seller
3. **White-Label Payment Integration**: Customized payment flow without exposing Paystack branding
4. **Automated Payout Engine**: Scheduled transfers to seller bank accounts

![Payment Flow Diagram](../public/payment-flow-diagram.png)

## Implementation Components

### 1. KYC Form (`src/components/payment/KYCForm.tsx`)

A secure form that collects:
- Government-issued ID information
- Bank account details

The form implements:
- File type and size validation
- Secure transmission of data
- Clear privacy notices

### 2. Payment Settings (`src/components/payment/PaymentSettings.tsx`)

Allows sellers to:
- Set up their payment account
- View their verification status
- Configure payment preferences

### 3. Payment Dashboard (`src/components/payment/PaymentDashboard.tsx`)

Provides sellers with:
- Current balance
- Next payout date
- Transaction history
- Fee transparency

### 4. API Endpoints

Backend API endpoints for payment processing:

- `netlify/functions/subaccounts.ts`: Creates a Paystack subaccount for a seller
- `netlify/functions/process-payout.js`: Processes payouts to seller bank accounts
- `src/api/payment/seller-balance.ts`: Gets the current balance for a seller
- `src/api/payment/transfer-webhook.ts`: Handles Paystack transfer status updates

### 5. Automated Payout Engine (`scripts/process-payouts.js`)

A cron job script that:
- Calculates available balances for all sellers
- Initiates payouts to seller bank accounts
- Updates payout records with status
- Handles retry logic for failed payouts

## Integration Details

### Subaccount Creation

When a seller sets up their payment account, we:

1. Collect bank details via the KYC form
2. Call the `/subaccounts` Netlify function to create a Paystack subaccount
3. Store the subaccount code in the seller's profile
4. Mark the seller as KYC verified

### Payment Processing

When a customer makes a payment:

1. The Paystack payment form is initialized with the seller's subaccount code
2. Paystack handles the payment securely
3. On successful payment, the order is marked as paid and the seller is notified
4. Funds are split automatically between the platform and the seller

### Automated Payouts

The automated payout engine:

1. Runs daily via a scheduled job
2. Calculates available balances for all sellers
3. Creates transfer recipients for each seller
4. Initiates transfers via the Paystack Transfer API
5. Updates payout records with transfer status

## Testing and Sandbox Mode

For testing purposes, use Paystack test keys and the test environment:

- Test cards: 5060666666666666 / 408 / 12/26
- Test bank accounts: See Paystack documentation

## Database Schema

The payment system uses the following database tables:

1. **profiles**: Extended with payment-related fields:
   - `paystack_api_key`: Seller's custom API key
   - `paystack_secret_key`: Admin-only secret key
   - `paystack_subaccount_id`: Seller's Paystack subaccount ID
   - `kyc_verified`: Whether the seller has completed KYC
   - `kyc_verified_at`: When the seller completed KYC

2. **payouts**: Records of all payouts to sellers:
   - `seller_id`: The seller receiving the payout
   - `amount`: Total amount in kobo
   - `fee`: Platform fee in kobo
   - `net_amount`: Net amount paid to seller
   - `status`: Processing status (processing, completed, failed)
   - `reference`: Unique reference for the payout
   - `account_number`: Bank account number
   - `bank_name`: Bank name
   - `account_name`: Account holder name
   - `transfer_id`: ID from Paystack

## Fee Structure

The payment system implements a 2% platform fee:
- 98% of each payment goes to the seller
- 2% is retained by the platform

This fee is transparently displayed to sellers in their payout history.

## Security Measures

The implementation includes several security measures:

1. **Secure KYC Data Handling**:
   - ID documents are only used for verification and then purged
   - Bank details are encrypted in the database

2. **API Security**:
   - All API endpoints require authentication
   - Sensitive operations require admin privileges

3. **Webhook Verification**:
   - Paystack webhook signatures are verified (to be implemented)

## Environment Variables

The following environment variables are required:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
VITE_PAYSTACK_SECRET_KEY=your-paystack-secret-key
VITE_SITE_URL=your-site-url
```

## Setup Instructions

1. Configure the required environment variables
2. Run the database migrations:
   ```
   supabase db push
   ```
3. Set up the payout cron job:
   ```
   crontab -e
   # Add the following line to run every 48 hours
   0 0 */2 * * node /path/to/scripts/process-payouts.js
   ```

## Future Enhancements

1. Implement webhook signature verification for enhanced security
2. Add support for multiple payment providers
3. Implement more detailed reporting and analytics
4. Add support for international payments and currency conversion 