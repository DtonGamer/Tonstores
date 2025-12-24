-- Add user_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'seller' 
CHECK (user_type IN ('buyer', 'seller'));

-- Update the trigger function to include user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ON CONFLICT DO NOTHING to handle duplicate keys
  INSERT INTO public.profiles (id, email, business_name, role, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')),
    'user',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'seller'), -- Default to seller if not specified
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Set the user as confirmed (disable email verification)
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles to have a default user_type if they don't have one
UPDATE public.profiles 
SET user_type = 'seller' 
WHERE user_type IS NULL;

-- Update RLS policy to consider user_type where appropriate
-- For example, we might want to restrict certain actions for buyers vs sellers