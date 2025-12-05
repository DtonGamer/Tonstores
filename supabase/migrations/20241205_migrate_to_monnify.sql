-- Migration to replace Paystack fields with Monnify fields in profiles table
-- This migration adds Monnify fields and removes Paystack fields

-- Add new Monnify columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monnify_api_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monnify_secret_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monnify_subaccount_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monnify_subaccount_id TEXT;

-- Copy existing Paystack subaccount code to Monnify subaccount code if Monnify field is empty
UPDATE profiles 
SET monnify_subaccount_code = paystack_subaccount_code
WHERE monnify_subaccount_code IS NULL 
  AND paystack_subaccount_code IS NOT NULL;

-- Remove Paystack columns
ALTER TABLE profiles DROP COLUMN IF EXISTS paystack_public_key CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS paystack_secret_key CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS paystack_subaccount_code CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS paystack_subaccount_id CASCADE;

-- Update the comment on ledger_entries.subaccount_code column to reflect Monnify
COMMENT ON COLUMN public.ledger_entries.subaccount_code IS 'Monnify subaccount code';