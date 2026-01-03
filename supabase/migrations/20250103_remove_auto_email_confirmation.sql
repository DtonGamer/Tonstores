-- Remove auto-email confirmation from the handle_new_user trigger
-- This is required because email verification has been enabled in Supabase

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

  -- REMOVED: Auto-email confirmation since email verification is now required
  -- UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
