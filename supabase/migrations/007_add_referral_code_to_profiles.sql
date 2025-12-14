-- Add a readable referral code column to profiles table
-- This allows users to have both UUID-based and readable referral codes

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Update existing profiles with a default referral code based on business name and user ID
-- For existing users, we'll generate a code based on their business name and a portion of their ID
UPDATE profiles 
SET referral_code = CONCAT(LOWER(REPLACE(business_name, ' ', '')), '_', RIGHT(id::text, 4))
WHERE referral_code IS NULL;

-- For any remaining null values, use a generic format with the last 8 characters of the UUID
UPDATE profiles 
SET referral_code = CONCAT('user_', RIGHT(id::text, 8))
WHERE referral_code IS NULL;

-- Make the referral_code column non-nullable and add a check constraint
ALTER TABLE profiles ALTER COLUMN referral_code SET NOT NULL;

-- Create a unique index to ensure referral codes are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Update the RLS policies to include the new column
-- No change needed as we're only adding a column

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_unique_referral_code(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  unique_code TEXT;
  counter INTEGER := 1;
  temp_code TEXT;
BEGIN
  -- Sanitize the input: remove spaces, special chars, limit length
  base_code := LOWER(REGEXP_REPLACE(input_text, '[^a-zA-Z0-9]', '', 'g'));
  base_code := LEFT(base_code, 10); -- Limit length to avoid very long codes
  
  IF LENGTH(base_code) < 3 THEN
    base_code := CONCAT('user_', RIGHT(gen_random_uuid()::text, 6));
  END IF;
  
  unique_code := base_code;
  
  -- Check if this code already exists, and if so, add a counter
  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = unique_code) LOOP
    temp_code := CONCAT(base_code, '_', counter);
    unique_code := temp_code;
    counter := counter + 1;
  END LOOP;
  
  RETURN unique_code;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically generate referral code when a new profile is created
CREATE OR REPLACE FUNCTION generate_referral_code_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a unique referral code based on business name
  NEW.referral_code := generate_unique_referral_code(NEW.business_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate referral code for new profiles
-- This is commented out since we want to control the referral code creation separately
-- CREATE TRIGGER trigger_generate_referral_code
--   BEFORE INSERT ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION generate_referral_code_for_new_profile();