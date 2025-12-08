# Supabase Functions Test Suite

This document provides instructions for testing the Supabase functions in the TonStores project using the test suite.

## Overview

The test suite includes tests for all Supabase functions:

- Monnify Banks
- Monnify Create Ledger Entry
- Monnify Customer Verification
- Monnify Escrow Webhook
- Monnify Initialize Escrow Transaction
- Monnify Ledger History
- Monnify Payout History
- Monnify Process Payout
- Monnify Release Escrow Funds
- Monnify Seller Balance
- Monnify Subaccount
- Monnify Transaction Receipt
- Monnify Verify Account
- Monnify Webhook
- Track Event
- Update Stock
- Update User Role

## Prerequisites

- [Deno](https://deno.land/) installed
- Supabase CLI (optional, for local development)
- Node.js (if using Supabase CLI)

## Setup

### 1. Environment Variables

Create a `.env.test` file in the project root with the following structure:

```bash
# Supabase Functions Test Environment Variables
# This file contains mock environment variables for testing Supabase functions

# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=test-anon-key-for-testing
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key-for-testing

# Monnify Configuration
MONNIFY_API_KEY=test-monnify-api-key
MONNIFY_SECRET_KEY=test-monnify-secret-key
MONNIFY_CONTRACT_CODE=test-contract-code
MONNIFY_WEBHOOK_URL=http://localhost:54321/functions/v1/monnify-webhook

# Paystack Configuration (if needed for comparison)
PAYSTACK_SECRET_KEY=test-paystack-secret-key
PAYSTACK_PUBLIC_KEY=test-paystack-public-key

# Resend Configuration for email notifications
RESEND_API_KEY=test-resend-api-key

# Development Mode
DEV_MODE=true

# Other Test Configuration
TEST_ENV=development
```

### 2. Local Supabase Setup (Optional)

If you want to run tests against your local Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start
```

## Running Tests

### Method 1: Direct Deno Execution

```bash
# Run all tests
deno run --allow-net --allow-env test_supabase_functions.ts

# Run tests with specific permissions (recommended)
deno run --allow-net=127.0.0.1:54321 --allow-env test_supabase_functions.ts
```

### Method 2: Using the Test Script with Production Supabase

To run tests against your production Supabase instance, make sure your environment variables are properly set in `.env.test`:

```bash
# Set the correct SUPABASE_URL for production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
```

Then run:

```bash
deno run --allow-net --allow-env test_supabase_functions.ts
```

### Method 3: Using Different Test Environments

You can run the tests against different environments by adjusting the environment variables:

```bash
# For staging
SUPABASE_URL=https://staging-project.supabase.co deno run --allow-net --allow-env test_supabase_functions.ts

# For local development
SUPABASE_URL=http://localhost:54321 deno run --allow-net --allow-env test_supabase_functions.ts
```

## Test Results

The test suite will output results in the following format:

```
Starting Supabase Functions Tests...

Running test: Monnify Banks
Description: Test the monnify-banks function
Result: PASS - Successfully retrieved banks list

...

TEST SUMMARY
==================================================
Total Tests: 17
Passed: 15
Failed: 1
Skipped: 1
==================================================
```

## Test Configuration

The test suite includes different behaviors based on the environment:

- **Development Mode**: When `DEV_MODE=true`, functions that interact with external services may return mock data instead of making real API calls.
- **Security**: Tests for functions that handle sensitive operations (like payouts) are skipped unless explicitly enabled in a development environment.
- **Authorization**: The test suite uses the appropriate tokens for each function based on its authorization requirements.

## Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure to run Deno with `--allow-net` and `--allow-env` flags.

2. **Network Errors**: Ensure your Supabase instance is running and accessible at the configured URL.

3. **Authentication Errors**: Verify that your API keys and tokens are correctly set in the environment variables.

4. **CORS Issues**: Make sure CORS is properly configured in your Supabase project.

### Verbose Logging

For additional debugging information, you can add logging to the test script:

```typescript
// Add console.log statements in the test methods to see detailed request/response information
console.log('Request payload:', payload);
console.log('Response status:', response.status);
console.log('Response body:', await response.text());
```

## Security Notes

- Never use production API keys in test environments unless necessary
- The test suite will skip sensitive operations like actual payouts in non-development environments
- Ensure that any test data does not impact production systems
- Use test-specific user accounts and payment information

## Test Coverage

- Each function has at least one test case
- Tests cover both success and error scenarios
- Development mode testing is included where applicable
- Authorization and authentication flows are tested
- Request/response handling is validated