-- Add fields to support manual payout system with 48-hour waiting period

-- Add requested_at field to track when a seller requests a payout
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payout_request TIMESTAMP WITH TIME ZONE;

-- Update the status enum to include 'requested' state if it doesn't exist
-- Note: We'll need to handle enum updates carefully
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payout_status' AND e.enumlabel = 'requested') THEN
        ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'requested';
    END IF;
END $$;

-- Add a column to track the next available payout time for each seller
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS next_payout_available_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index for better performance on payout queries
CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON payouts (requested_at);
CREATE INDEX IF NOT EXISTS idx_payouts_seller_status ON payouts (seller_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_next_payout ON profiles (next_payout_available_at);