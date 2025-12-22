-- Script to recreate missing Paystack subaccounts
-- This script will help identify and fix subaccounts that exist in the database but not in Paystack

-- First, let's identify profiles that have subaccount codes in the database but may not exist in Paystack
SELECT 
    id,
    business_name,
    paystack_subaccount_code,
    kyc_verified,
    paystack_kyc_status,
    created_at
FROM profiles 
WHERE paystack_subaccount_code IS NOT NULL
ORDER BY created_at DESC;

-- To fix missing subaccounts, you would need to call the Paystack API again with the stored bank details
-- Here's a template for the API call you'd need to make for each missing subaccount:

/*
curl -X POST https://api.paystack.co/subaccount \
-H "Authorization: Bearer YOUR_SECRET_KEY" \
-H "Content-Type: application/json" \
-d '{
  "business_name": "BUSINESS_NAME",
  "account_number": "ACCOUNT_NUMBER",
  "bank_code": "BANK_CODE",
  "percentage_charge": 1.5,
  "primary_contact_email": "EMAIL",
  "primary_contact_name": "CONTACT_NAME",
  "primary_contact_phone": "PHONE"
}'
*/

-- You can also check if there are payment accounts with bank details that might help reconstruct the subaccount
SELECT 
    pa.profile_id,
    p.business_name,
    pa.account_number,
    pa.bank_name,
    pa.bank_code,
    pa.subaccount_code,
    p.paystack_subaccount_code
FROM payment_accounts pa
JOIN profiles p ON pa.profile_id = p.id
WHERE pa.subaccount_code IS NOT NULL
ORDER BY pa.created_at DESC;

-- If you need to update the payment_accounts table to reflect the correct subaccount codes:
-- UPDATE payment_accounts SET subaccount_code = 'NEW_SUBACCOUNT_CODE' WHERE profile_id = 'USER_ID';