-- Create a view that properly joins affiliates with profiles information
-- This should resolve the relationship issues in PostgREST

-- Drop the existing view if it exists
DROP VIEW IF EXISTS affiliate_with_profile_view;

-- Create view that joins affiliates with profile information
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

-- Grant permissions on the view
GRANT SELECT ON affiliate_with_profile_view TO authenticated;

-- Refresh the schema to make the view available to PostgREST
NOTIFY pgrst, 'reload schema';