-- Ensure proper foreign key constraints and relationships for the affiliates table
-- This migration ensures that foreign key relationships are properly recognized by the schema

-- First, make sure the correct indexes exist
CREATE INDEX IF NOT EXISTS idx_affiliates_referrer_id_new ON affiliates(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referred_user_id_new ON affiliates(referred_user_id);

-- Add comments to help with schema recognition
COMMENT ON COLUMN affiliates.referrer_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN affiliates.referred_user_id IS 'Foreign key reference to auth.users table';

-- Make sure the RLS policies are correctly set
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
  );

DROP POLICY IF EXISTS "Users can apply to be affiliates" ON affiliates;
CREATE POLICY "Users can apply to be affiliates" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can update their own affiliate data" ON affiliates;
CREATE POLICY "Users can update their own affiliate data" ON affiliates
  FOR UPDATE USING (auth.uid() = referrer_id) WITH CHECK (auth.uid() = referrer_id);

-- Refresh the schema to clear any cached relationship issues
NOTIFY pgrst, 'reload schema';