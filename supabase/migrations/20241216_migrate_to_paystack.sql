-- Migration: Remove Monnify columns and add Paystack columns

-- Remove Monnify-specific columns from profiles table
ALTER TABLE profiles
DROP COLUMN IF EXISTS monnify_subaccount_code,
DROP COLUMN IF EXISTS monnify_account_number,
DROP COLUMN IF EXISTS monnify_bvn,
DROP COLUMN IF EXISTS monnify_kyc_status,
DROP COLUMN IF EXISTS monnify_kyc_submitted_at;

-- Add Paystack-specific columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_account_number TEXT,
ADD COLUMN IF NOT EXISTS paystack_bvn TEXT,
ADD COLUMN IF NOT EXISTS paystack_kyc_status TEXT DEFAULT 'pending', -- pending, verified, rejected
ADD COLUMN IF NOT EXISTS paystack_kyc_submitted_at TIMESTAMP WITH TIME ZONE;

-- Update orders table for Paystack compatibility
-- Remove Monnify-specific columns
ALTER TABLE orders
DROP COLUMN IF EXISTS monnify_transaction_reference;

-- Add Paystack-specific columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paystack_transaction_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_access_code TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'paystack'; -- Add payment gateway column

-- Update the ledger_entries table to be more generic for Paystack compatibility
-- (subaccount_code is already generic and can work with Paystack)

-- Create indexes on the new Paystack columns for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_subaccount_code ON profiles(paystack_subaccount_code);
CREATE INDEX IF NOT EXISTS idx_profiles_paystack_kyc_status ON profiles(paystack_kyc_status);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_transaction_reference ON orders(paystack_transaction_reference);
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway);

-- Update existing orders to use 'paystack' as the payment gateway
UPDATE orders 
SET payment_gateway = 'paystack'
WHERE payment_gateway IS NULL OR payment_gateway = 'monnify' OR payment_gateway = '';

-- Create a new table for Paystack transactions to store detailed transaction information
CREATE TABLE IF NOT EXISTS paystack_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    transaction_reference TEXT NOT NULL,
    amount INTEGER NOT NULL, -- in kobo
    currency TEXT DEFAULT 'NGN',
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'initialized', -- initialized, pending, success, failed
    subaccount_code TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the paystack_transactions table
CREATE INDEX IF NOT EXISTS idx_paystack_transactions_user_id ON paystack_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paystack_transactions_order_id ON paystack_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_paystack_transactions_reference ON paystack_transactions(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_paystack_transactions_customer_email ON paystack_transactions(customer_email);

-- Create RLS policies for paystack_transactions table
ALTER TABLE paystack_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own Paystack transactions
CREATE POLICY "Users can view their own paystack transactions" ON paystack_transactions
FOR SELECT USING (
    auth.uid() = user_id
);

-- Policy: Users can insert their own Paystack transactions
CREATE POLICY "Users can insert their own paystack transactions" ON paystack_transactions
FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Policy: Users can update their own Paystack transactions
CREATE POLICY "Users can update their own paystack transactions" ON paystack_transactions
FOR UPDATE USING (
    auth.uid() = user_id
);