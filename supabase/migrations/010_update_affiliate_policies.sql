-- Update RLS policies for the affiliate_with_profile_view
-- Also ensure proper access to the view

-- Enable RLS on the view if needed (though views typically inherit RLS from base tables)
-- Grant proper permissions on the view
GRANT SELECT ON affiliate_with_profile_view TO authenticated;

-- Update policies for the affiliates table to ensure they work properly
-- These policies should allow users to access their own affiliate data
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_user_id
  );

-- Make sure profiles policy is also properly set
-- Grant access for authenticated users to view profiles (for the view join)
GRANT SELECT ON profiles TO authenticated;

-- Refresh the schema to ensure all changes are recognized
NOTIFY pgrst, 'reload schema';