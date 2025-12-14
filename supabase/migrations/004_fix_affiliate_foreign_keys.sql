-- Fix the foreign key relationship between affiliates and profiles tables
-- This migration fixes the relationship that's causing the schema cache error

-- Create indexes if they don't exist to support the foreign key relationships
CREATE INDEX IF NOT EXISTS idx_affiliates_referrer_id ON affiliates(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referred_user_id ON affiliates(referred_user_id);

-- Verify the foreign key constraints exist
-- These should already be in place from the original migration, but we'll ensure they exist
ALTER TABLE affiliates 
ADD CONSTRAINT affiliates_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT affiliates_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- If you're using the profiles table as a reference instead of auth.users, you might need:
-- ALTER TABLE affiliates 
-- ADD CONSTRAINT affiliates_referrer_id_fkey_profiles 
-- FOREIGN KEY (referrer_id) REFERENCES profiles(id) ON DELETE CASCADE,
-- ADD CONSTRAINT affiliates_referred_user_id_fkey_profiles 
-- FOREIGN KEY (referred_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Refresh the schema cache by ensuring there's a proper relationship in the RLS policies
-- Update policies to ensure they're properly set up
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
  );

-- Make sure the RLS is enabled
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;