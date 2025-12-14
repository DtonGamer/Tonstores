-- Add affiliate-related columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'inactive' CHECK (affiliate_status IN ('active', 'pending', 'inactive')),
ADD COLUMN IF NOT EXISTS affiliate_commission_rate DECIMAL(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS affiliate_total_earnings DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS affiliate_total_referrals INTEGER DEFAULT 0;

-- Update RLS policies to include affiliate columns if they don't exist
DO $$
BEGIN
  -- Check if the policy exists and create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Allow users to read own profile data'
  ) THEN
    CREATE POLICY "Allow users to read own profile data" ON profiles
      FOR SELECT TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Create policy for users to update their own profile including affiliate status
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Allow users to update own profile data including affiliate status'
  ) THEN
    CREATE POLICY "Allow users to update own profile data including affiliate status" ON profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;