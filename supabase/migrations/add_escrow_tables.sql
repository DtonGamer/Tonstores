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
    status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
    escrow_account_code TEXT,
    release_to_subaccount TEXT,
    release_amount INTEGER,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order_id ON escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_escrow_account ON escrow_transactions(escrow_account_code);

-- Enable Row Level Security for both tables
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

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

-- Update the orders table to ensure it has the necessary escrow fields
-- These might already exist from previous migration, but adding here to ensure
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'held' CHECK (escrow_status IN ('held', 'released', 'refunded')),
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE;

-- Add a comment to explain the escrow_status column
COMMENT ON COLUMN orders.escrow_status IS 'Escrow status: held, released, refunded';