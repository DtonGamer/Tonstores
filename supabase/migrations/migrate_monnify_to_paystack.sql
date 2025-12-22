-- Migration: Update database schema from Monnify to Paystack

-- Add paystack_percentage_charge column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS paystack_percentage_charge NUMERIC DEFAULT 1.5;

-- Update the paystack_percentage_charge from the monnify_percentage_charge value
UPDATE profiles 
SET paystack_percentage_charge = monnify_percentage_charge::NUMERIC
WHERE monnify_percentage_charge IS NOT NULL AND paystack_percentage_charge IS NULL;

-- Clean up Monnify-specific columns that are no longer needed
ALTER TABLE profiles 
DROP COLUMN IF EXISTS monnify_subaccount_code,
DROP COLUMN IF EXISTS monnify_account_number,
DROP COLUMN IF EXISTS monnify_bvn,
DROP COLUMN IF EXISTS monnify_kyc_status,
DROP COLUMN IF EXISTS monnify_kyc_submitted_at,
DROP COLUMN IF EXISTS monnify_percentage_charge;

-- Update any remaining Monnify references in the orders table to Paystack
UPDATE orders 
SET payment_provider = 'paystack' 
WHERE payment_provider = 'monnify' OR payment_provider = 'moniepoint';

-- Update the payment_gateway column as well
UPDATE orders 
SET payment_gateway = 'paystack' 
WHERE payment_gateway = 'monnify' OR payment_gateway = 'moniepoint' OR payment_gateway = '';

-- Update the transaction_reference column comment to reflect Paystack
COMMENT ON COLUMN orders.transaction_reference IS 'Paystack transaction reference';

-- Update the ledger_entries table comment to reflect Paystack
COMMENT ON COLUMN public.ledger_entries.subaccount_code IS 'Paystack subaccount code';

-- Update income_split_configs table comment to reflect Paystack
COMMENT ON COLUMN income_split_configs.subaccount_code IS 'Payment provider subaccount code (currently Paystack)';

-- Update any existing records in orders table with payment_provider set to 'monnify' to 'paystack'
UPDATE orders
SET payment_provider = 'paystack'
WHERE payment_provider = 'monnify';

-- Update the orders table to ensure all historical data has proper payment_gateway values
UPDATE orders
SET payment_gateway = 'paystack'
WHERE payment_gateway = 'monnify' OR payment_gateway = '';

-- Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Migration summary:';
  RAISE NOTICE 'Profiles with paystack_percentage_charge: %', (SELECT COUNT(*) FROM profiles WHERE paystack_percentage_charge IS NOT NULL);
  RAISE NOTICE 'Orders updated to Paystack provider: %', (SELECT COUNT(*) FROM orders WHERE payment_provider = 'paystack');
  RAISE NOTICE 'Orders updated to Paystack gateway: %', (SELECT COUNT(*) FROM orders WHERE payment_gateway = 'paystack');
END $$;