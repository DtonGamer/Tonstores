-- Create proper foreign key constraints from affiliates to profiles table
-- This will enable the joins needed for the referral system

-- First, make sure we have the same user IDs in profiles as in auth.users
-- The profiles table should have the same id as auth.users(id) since it's linked by the id field

-- Check if the constraints already exist, and if not, create them
-- These foreign keys should reference profiles.id instead of auth.users.id for the joins to work properly
-- Actually, let's make sure the foreign key constraints reference auth.users since that's the base

-- The issue is that while affiliates table references auth.users, we're trying to join with profiles
-- In Supabase, the profiles table typically has the same id as auth.users for the relationship
-- So we need to ensure that the foreign key relationship is recognized properly

-- Let's make sure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_affiliates_referrer_id ON affiliates(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referred_user_id ON affiliates(referred_user_id);

-- Since profiles.id and auth.users.id should match, ensure proper constraints
-- Verify that the foreign key constraints exist properly
DO $$
BEGIN
  -- Add constraints if they don't exist, but reference auth.users as that's the base
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'affiliates_referrer_id_fkey'
    AND table_name = 'affiliates'
  ) THEN
    ALTER TABLE affiliates 
    ADD CONSTRAINT affiliates_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'affiliates_referred_user_id_fkey' 
    AND table_name = 'affiliates'
  ) THEN
    ALTER TABLE affiliates 
    ADD CONSTRAINT affiliates_referred_user_id_fkey 
    FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create a relationship view or ensure the join works by updating RLS policies
-- The issue might be that PostgREST can't recognize the join automatically
-- Let's make sure the profiles RLS policy is compatible
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON affiliates TO authenticated;

-- Refresh the schema
NOTIFY pgrst, 'reload schema';