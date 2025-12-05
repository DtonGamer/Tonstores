-- Corrected function with proper search_path setting
CREATE OR REPLACE FUNCTION public.set_app_guest_id(guest_id text)
RETURNS void
SECURITY DEFINER
SET search_path = ''  -- This prevents search_path manipulation
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('app.guest_id', guest_id, FALSE);
END;
$$; 