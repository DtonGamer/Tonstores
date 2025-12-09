-- Migration: Add percentage charge to profiles table

-- Add a field for the percentage charge that can be configured per user
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monnify_percentage_charge DECIMAL(5,2) DEFAULT 1.50;

-- Create an index for better performance when querying by percentage charge
CREATE INDEX IF NOT EXISTS idx_profiles_monnify_percentage_charge ON profiles(monnify_percentage_charge);