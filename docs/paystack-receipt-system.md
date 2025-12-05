# Paystack Transaction Receipt System

This document explains the implementation of the transaction receipt system for TonStores, which sends receipts to both customers and sellers after successful payments.

## Overview

The receipt system has been designed to provide a seamless and branded experience for both customers and sellers:

1. **Automatic Receipt Generation**: When a payment is processed through Paystack, the system automatically generates and sends receipts to both the customer and the seller.

2. **Webhook-Based Processing**: The system primarily relies on Paystack webhooks to process transactions and send receipts in real-time, ensuring reliability even if customers face network issues during checkout.

3. **Manual Fallback**: A manual receipt sending feature is available as a fallback option for transactions where automatic receipts failed to send.

4. **Branded Experience**: Both receipts are fully customizable with the seller's branding (business name, logo, contact information).

## System Components

### 1. Webhook Handler (`paystack-webhook.js`)

The webhook handler is a Netlify serverless function that:

- Receives transaction notifications from Paystack
- Verifies the webhook signature for security
- Extracts transaction and customer details
- Sends branded receipts to both seller and customer
- Updates the order status in the database

### 2. Manual Receipt Sender (`transaction-receipt.js`)

A dedicated API endpoint for manually triggering receipt sending for specific transactions:

- Verifies the transaction with Paystack API
- Retrieves seller information from the database
- Generates and sends receipts to both parties
- Updates the order status in the database

### 3. Webhook Configuration Utility (`configure-webhook.js`)

A utility to help sellers configure their Paystack account to use the TonStores webhook:

- Programmatically sets up webhooks on the seller's Paystack account
- Handles duplicate webhook detection
- Updates seller profile with webhook configuration status

### 4. Frontend Service (`receipts.ts`)

A TypeScript service that provides frontend components with:

- Functions for manual receipt sending
- Functions for webhook configuration
- Toast notifications for feedback
- Error handling

## Receipt Templates

### Customer Receipt

The customer receipt includes:

- Seller's business name and logo
- Transaction details (reference number, amount, date)
- Product information
- Payment status
- Seller's contact information for inquiries

### Seller Receipt

The seller receipt includes:

- Sale notification
- Transaction details (reference number, amount, date)
- Product information
- Customer details (name, email, phone)
- Link to view more details in the dashboard

## Implementation Flow

### Automatic Receipt Sending

1. Customer completes payment on the WhatsApp catalog.
2. Paystack processes the payment and sends a webhook notification to the configured webhook URL.
3. The webhook handler verifies the webhook signature.
4. The system retrieves seller information from the database.
5. Custom receipts are generated for both the customer and seller.
6. Receipts are sent via email.
7. The order status is updated in the database.

### Manual Receipt Sending

1. Admin or seller triggers receipt sending from the dashboard.
2. The system verifies the transaction with Paystack.
3. Custom receipts are generated for both parties.
4. Receipts are sent via email.
5. The order status is updated in the database.

## Security Considerations

1. **Webhook Signature Verification**: All webhook requests are verified using HMAC-SHA512 signatures.
2. **API Key Security**: Paystack API keys are stored securely in the database with appropriate access controls.
3. **Validation**: All input parameters are validated before processing.

## Configuration

To configure the receipt system:

1. Set environment variables:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` for database access
   - `PAYSTACK_SECRET_KEY` for Paystack API access
   - `RESEND_API_KEY` for email sending

2. Deploy the Netlify functions:
   - `paystack-webhook.js`
   - `transaction-receipt.js`
   - `configure-webhook.js`

3. Configure webhooks in the Paystack dashboard or use the configuration utility.

## Recommended Email Service

The system currently uses Resend for sending emails. This is recommended because:

- It provides reliable delivery
- Supports HTML emails with good rendering across email clients
- Offers analytics for tracking email delivery and opens
- Has a generous free tier for testing

## Testing

You can test the receipt system by:

1. Using Paystack's test mode to simulate transactions
2. Manually sending receipts for specific transactions
3. Checking the logs for error messages

## Logging and Monitoring

The system logs all webhook events and receipt sending attempts. Common error scenarios are handled with appropriate error messages for debugging.

## Future Improvements

Potential enhancements to consider:

1. SMS notifications for sellers without reliable email access
2. Receipt templates customization in the dashboard
3. Support for additional languages
4. Receipt archiving and retrieval system 