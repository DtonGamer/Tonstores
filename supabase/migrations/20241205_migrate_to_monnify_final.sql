-- Migration: Remove Paystack columns and add Monnify columns

-- Remove Paystack-specific columns from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS paystack_subaccount_code,
DROP COLUMN IF EXISTS paystack_subaccount_id;

-- Add Monnify-specific columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS monnify_subaccount_code TEXT,
ADD COLUMN IF NOT EXISTS monnify_account_number TEXT,
ADD COLUMN IF NOT EXISTS monnify_bvn TEXT,
ADD COLUMN IF NOT EXISTS monnify_kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
ADD COLUMN IF NOT EXISTS monnify_kyc_submitted_at TIMESTAMP WITH TIME ZONE;

-- Update the ledger_entries table to be more generic for Monnify compatibility
-- (subaccount_code is already generic and can work with Monnify)

-- If you want to add a specific Monnify transaction reference column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS monnify_transaction_reference TEXT;

-- Update the RLS policies if they reference paystack columns
-- This assumes you have existing policies that might reference paystack columns
-- You would need to adjust your RLS policies to work with the new column names

-- Create an index on the new Monnify columns for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_monnify_subaccount_code ON profiles(monnify_subaccount_code);
CREATE INDEX IF NOT EXISTS idx_profiles_monnify_kyc_status ON profiles(monnify_kyc_status);
CREATE INDEX IF NOT EXISTS idx_orders_monnify_transaction_reference ON orders(monnify_transaction_reference);

-- Optional: Create a function to migrate existing paystack data to monnify columns
-- (This is only needed if you want to preserve existing Paystack subaccount data)
-- UPDATE profiles 
-- SET monnify_subaccount_code = paystack_subaccount_code 
-- WHERE paystack_subaccount_code IS NOT NULL AND monnify_subaccount_code IS NULL;

-- You can run the above update query if you had existing Paystack subaccount data to preserve
-- and then drop the Paystack columns after the migration