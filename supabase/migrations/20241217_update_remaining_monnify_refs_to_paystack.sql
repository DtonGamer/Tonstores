-- Migration: Update remaining Monnify references to Paystack in database schema

-- Update the platform_accounts table to rename monnify_subaccount_code to paystack_subaccount_code
ALTER TABLE platform_accounts 
RENAME COLUMN monnify_subaccount_code TO paystack_subaccount_code;

-- Update the comment on the column to reflect Paystack instead of Monnify
COMMENT ON COLUMN platform_accounts.paystack_subaccount_code IS 'Paystack subaccount code';

-- Update the orders table to rename the transaction reference column to be more generic
-- We'll keep the transaction_reference column as it's generic enough for any payment system
-- But update the comment to reflect it's now Paystack-specific
COMMENT ON COLUMN orders.transaction_reference IS 'Paystack transaction reference';

-- Update the ledger_entries table comment to reflect Paystack instead of Monnify (if it was referencing Monnify)
-- Check if the column exists and update comment accordingly
COMMENT ON COLUMN public.ledger_entries.subaccount_code IS 'Paystack subaccount code';

-- Create a new migration to update any existing data that might still reference Monnify
-- Update any existing records in orders table with payment_provider set to 'monnify' to 'paystack'
UPDATE orders
SET payment_provider = 'paystack'
WHERE payment_provider = 'monnify';

-- Update the payment_provider enum type if it exists to remove 'monnify' and keep 'paystack'
-- First, we need to find if there's an enum type for payment_provider
-- If you have an enum type that includes 'monnify', you would need to alter it like this:
-- ALTER TYPE payment_provider_enum ADD VALUE IF NOT EXISTS 'paystack';
-- ALTER TYPE payment_provider_enum DROP VALUE IF EXISTS 'monnify'; -- This is complex and might require recreating the enum

-- For now, let's make sure the payment_provider column in orders table doesn't have 'monnify' anymore
-- This has already been done above with the UPDATE statement

-- Update the orders table to ensure all historical data has proper payment_gateway values
UPDATE orders
SET payment_gateway = 'paystack'
WHERE payment_gateway = 'monnify' OR payment_gateway = '';

-- Update any function definitions that might reference Monnify to reference Paystack instead
-- This would typically be done by replacing the function with a new version

-- In case there are any remaining references in the income_split_configs table comment
-- that reference Monnify, we'll update them to be generic or Paystack-specific
-- Since this table doesn't have Monnify-specific column names, we'll just ensure the comments are generic
COMMENT ON COLUMN income_split_configs.subaccount_code IS 'Payment provider subaccount code (currently Paystack)';

-- If there are any remaining Monnify-specific indexes, drop them and create Paystack-specific ones
-- Check if monnify-specific indexes exist and drop them
DROP INDEX IF EXISTS idx_orders_monnify_transaction_reference;

-- The Paystack indexes should already be created from the migrate_to_paystack.sql migration
-- So we don't need to recreate them if they already exist

-- If there are any views that reference Monnify, update them to be generic or Paystack-specific
-- Example: If there's a view that references monnify columns, update it
-- This would be handled on a case-by-case basis depending on what views exist

-- Ensure the RLS policies are still correct after column renames
-- The RLS policies should work with the new column names since they were based on generic functionality

-- Verify that all necessary indexes exist for Paystack functionality
CREATE INDEX IF NOT EXISTS idx_platform_accounts_subaccount_code ON platform_accounts(paystack_subaccount_code);

-- Update any check constraints if they specifically reference 'monnify'
-- This is unlikely but if there are any, they should be updated to reflect Paystack

-- Update the escrow_transactions table comment if it references Monnify
COMMENT ON COLUMN escrow_transactions.escrow_account_code IS 'Platform account code for escrow (Paystack subaccount code)';