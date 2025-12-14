-- Create the affiliates table to track referrals
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- 20% default commission
  total_spent DECIMAL(12,2) DEFAULT 0.00,
  commission_earned DECIMAL(12,2) DEFAULT 0.00,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure each referral is unique
  UNIQUE(referred_user_id),

  -- Ensure a user can't refer themselves (for actual referrals)
  -- NOTE: For applications, we handle this in the application logic
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_user_id)
);

-- Enable Row Level Security (RLS) on the affiliates table
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own affiliate data
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
  );

-- Create policy to allow users to insert their own affiliate data
CREATE POLICY "Users can apply to be affiliates" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create policy to allow users to update their own affiliate data
CREATE POLICY "Users can update their own affiliate data" ON affiliates
  FOR UPDATE USING (auth.uid() = referrer_id) WITH CHECK (auth.uid() = referrer_id);

-- Create indexes for better performance
CREATE INDEX idx_affiliates_referrer_id ON affiliates(referrer_id);
CREATE INDEX idx_affiliates_referred_user_id ON affiliates(referred_user_id);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_joined_at ON affiliates(joined_at);

-- Create function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update 'updated_at' timestamp
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update profile when user becomes affiliate
CREATE OR REPLACE FUNCTION update_affiliate_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the referred user's profile to indicate they joined through affiliate
  UPDATE profiles
  SET
    is_affiliate = TRUE,
    affiliate_status = 'active',
    affiliate_commission_rate = NEW.commission_rate
  WHERE id = NEW.referred_user_id;

  -- Update the referrer's profile with stats
  UPDATE profiles
  SET
    affiliate_total_referrals = COALESCE(affiliate_total_referrals, 0) + 1
  WHERE id = NEW.referrer_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update affiliate status when affiliate record is created
CREATE TRIGGER update_affiliate_status_trigger
  AFTER INSERT ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_status();

-- Create function for when a user applies to become an affiliate (referrer)
CREATE OR REPLACE FUNCTION update_user_affiliate_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's profile to indicate they applied to be an affiliate
  UPDATE profiles
  SET
    is_affiliate = CASE
      WHEN NEW.status = 'active' THEN TRUE
      ELSE FALSE
    END,
    affiliate_status = NEW.status
  WHERE id = NEW.referrer_id AND NEW.referrer_id = NEW.referred_user_id; -- Self-referral indicates application

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update profile when user applies to become affiliate
CREATE TRIGGER update_user_affiliate_application_trigger
  AFTER INSERT OR UPDATE ON affiliates
  FOR EACH ROW
  WHEN (NEW.referrer_id = NEW.referred_user_id) -- Only when user refers themselves (application)
  EXECUTE FUNCTION update_user_affiliate_application();