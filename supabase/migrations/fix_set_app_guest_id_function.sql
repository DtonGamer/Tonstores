-- Function to set app.guest_id for RLS
CREATE OR REPLACE FUNCTION public.set_app_guest_id(guest_id TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS
$$
BEGIN
  PERFORM set_config('app.guest_id', guest_id, FALSE);
END;
$$;

-- Make sure the app.guest_id setting is available
ALTER DATABASE postgres SET app.guest_id TO NULL; 