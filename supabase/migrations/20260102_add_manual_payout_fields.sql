-- Add columns to track payout eligibility and last payout
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_payout_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_payout_available_at TIMESTAMPTZ;

-- Add bank_code to payouts table if missing
ALTER TABLE payouts
ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_last_payout 
ON profiles(last_payout_at);

CREATE INDEX IF NOT EXISTS idx_profiles_next_payout 
ON profiles(next_payout_available_at);

-- Function to check if seller can request payout based on T+1 schedule
CREATE OR REPLACE FUNCTION can_request_payout(seller_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  next_payout TIMESTAMPTZ;
BEGIN
  SELECT next_payout_available_at INTO next_payout
  FROM profiles
  WHERE id = seller_profile_id;

  -- If never requested payout before, they can request
  IF next_payout IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Can request if current time is past next_payout_available_at (T+1 schedule)
  RETURN NOW() >= next_payout;
END;
$$ LANGUAGE plpgsql;