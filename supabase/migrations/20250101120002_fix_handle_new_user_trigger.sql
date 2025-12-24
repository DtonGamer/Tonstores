-- Fix the handle_new_user trigger function that was corrupted
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