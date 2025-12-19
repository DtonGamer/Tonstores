-- Fix SECURITY DEFINER view issue for affiliate_with_profile_view
-- This migration recreates the view to ensure it doesn't use SECURITY DEFINER

-- First, drop the existing view
DROP VIEW IF EXISTS affiliate_with_profile_view;

-- Create the view using SECURITY INVOKER (default) approach
-- This ensures the view respects the permissions of the querying user
CREATE VIEW affiliate_with_profile_view AS
SELECT
    a.id,
    a.referrer_id,
    a.referred_user_id,
    a.status,
    a.joined_at,
    a.total_spent,
    a.commission_earned,
    a.commission_rate,
    a.referral_type,
    p.business_name as referred_user_business_name,
    p.created_at as referred_user_created_at,
    p.referral_code as referred_user_referral_code
FROM affiliates a
LEFT JOIN profiles p ON a.referred_user_id = p.id;

-- Explicitly grant permissions to ensure proper access
GRANT SELECT ON affiliate_with_profile_view TO authenticated;

-- The view will inherit the RLS policies from the underlying tables (affiliates and profiles)
-- No need to explicitly enable RLS on the view or create policies for the view itself

-- Refresh the schema to ensure all changes are recognized
NOTIFY pgrst, 'reload schema';