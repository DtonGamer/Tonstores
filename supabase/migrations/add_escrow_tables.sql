-- Migration to add platform accounts table for escrow functionality
-- This table stores platform account information used for holding escrow funds

-- Create the platform_accounts table
CREATE TABLE IF NOT EXISTS platform_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_name TEXT NOT NULL,
    monnify_subaccount_code TEXT UNIQUE NOT NULL,
    is_escrow_account BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the escrow_transactions table to track escrow operations
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    transaction_reference TEXT UNIQUE NOT NULL,
    payment_reference TEXT,
    amount INTEGER NOT NULL, -- Amount in kobo
    currency TEXT DEFAULT 'NGN',
    customer_email TEXT,
    status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'failed')),
    escrow_account_code TEXT,
    release_to_subaccount TEXT,
    release_amount INTEGER,
    released_at TIMESTAMP WITH TIME ZONE,
    original_income_split_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the income_split_configs table to store split configurations for escrow releases
CREATE TABLE IF NOT EXISTS income_split_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subaccount_code TEXT NOT NULL,
    fee_percentage NUMERIC DEFAULT 0,
    split_percentage NUMERIC NOT NULL,
    fee_bearer BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending_release' CHECK (status IN ('pending_release', 'released', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, subaccount_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order_id ON escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_escrow_account ON escrow_transactions(escrow_account_code);
CREATE INDEX IF NOT EXISTS idx_income_split_configs_order_id ON income_split_configs(order_id);
CREATE INDEX IF NOT EXISTS idx_income_split_configs_user_id ON income_split_configs(user_id);

-- Enable Row Level Security for all tables
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_split_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_accounts
-- Only service role can modify platform accounts
CREATE POLICY "Platform accounts are manageable by service role only" ON platform_accounts
FOR ALL TO service_role
USING (true);

-- Create policies for escrow_transactions
-- Authenticated users can view their own escrow transactions
CREATE POLICY "Users can view own escrow transactions" ON escrow_transactions
FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() = user_id
);

-- Service role can manage all escrow transactions
CREATE POLICY "Service role can manage all escrow transactions" ON escrow_transactions
FOR ALL TO service_role
USING (true);

-- Create policies for income_split_configs
-- Users can view their own split configurations
CREATE POLICY "Users can view own split configs" ON income_split_configs
FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid() = user_id
);

-- Service role can manage all split configurations
CREATE POLICY "Service role can manage all split configs" ON income_split_configs
FOR ALL TO service_role
USING (true);

-- Update the orders table to ensure it has the necessary escrow fields
-- These might already exist from previous migration, but adding here to ensure
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'held' CHECK (escrow_status IN ('held', 'released', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transaction_reference TEXT; -- Link to Monnify transaction reference

-- Add a comment to explain the escrow_status column
COMMENT ON COLUMN orders.escrow_status IS 'Escrow status: held, released, refunded, failed';