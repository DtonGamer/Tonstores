-- Update the affiliates table to allow affiliate applications by removing the problematic trigger
-- and ensuring that affiliate applications are handled through profile updates

-- Remove the trigger that was causing issues with self-referrals during application
DROP TRIGGER IF EXISTS update_user_affiliate_application_trigger ON affiliates;

-- Add a column to distinguish between affiliate applications and actual referrals
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS referral_type TEXT DEFAULT 'referral' CHECK (referral_type IN ('referral', 'application'));

-- Update the check constraint to allow self-referral for application type only
-- Note: Since the constraint already exists, we need to drop and recreate the table or handle differently
-- Instead, we'll just ensure the application logic prevents direct insertion of self-referrals

-- We'll continue to handle affiliate applications via profile updates as implemented in the service