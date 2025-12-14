-- Ensure the correct foreign key constraints exist between affiliates and auth.users tables
-- This migration ensures proper relationship recognition by PostgREST

-- First, let's make sure we have the correct foreign key constraints
DO $$
BEGIN
  -- Check if the foreign key constraints exist and create them if they don't
  -- We'll use the standard naming convention that Supabase typically uses
  
  -- For referrer_id
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

  -- For referred_user_id
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

-- Create indexes to support the foreign key relationships
CREATE INDEX IF NOT EXISTS idx_affiliates_referrer_id ON affiliates(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referred_user_id ON affiliates(referred_user_id);

-- Make sure the RLS policies are in place
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
  );

-- Grant necessary permissions
GRANT ALL ON affiliates TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;