-- Update the profiles table policies

-- First, drop the existing policy
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;

-- Create a policy for selecting profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Create a policy for updating profiles
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a policy for the trigger to insert profiles
CREATE POLICY "Trigger can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Enable RLS on the profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 