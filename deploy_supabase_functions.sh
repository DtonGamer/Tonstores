#!/bin/bash
# Supabase Functions Deployment Script

echo "Starting deployment of updated Supabase functions..."

# Deploy all functions at once
npx supabase functions deploy 

echo "Deployment completed. The following functions have been updated with correct CORS headers:"
echo "- monnify-initialize-transaction"
echo "- monnify-subaccount"
echo "- monnify-verify-account"
echo "- monnify-banks"
echo "- monnify-create-ledger-entry"
echo "- monnify-create-split"
echo "- monnify-customer-verification"
echo "- monnify-ledger-history"
echo "- monnify-payout-history"
echo "- monnify-process-payout"
echo "- monnify-seller-balance"
echo "- monnify-transaction-receipt"
echo "- monnify-webhook"
echo "- update-stock"
echo ""
echo "All functions now include X-Guest-ID, apikey, and cache-control in their CORS headers."

echo ""
echo "If you have issues with deployment, you might need to:"
echo "1. Run 'supabase login' to authenticate with your Supabase account"
echo "2. Run 'supabase link --project-ref <your-project-ref>' to link to your project"
echo "3. Then run this script again"