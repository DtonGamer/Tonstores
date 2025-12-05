-- Fix subscriptions table RLS policies

-- First, ensure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own subscriptions
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure pricing_plans table has appropriate RLS policies
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view pricing plans
DROP POLICY IF EXISTS "Anyone can view pricing plans" ON public.pricing_plans;
CREATE POLICY "Anyone can view pricing plans" 
ON public.pricing_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.pricing_plans TO authenticated; 