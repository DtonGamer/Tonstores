-- Fix the get_guest_orders function with proper search_path setting
CREATE OR REPLACE FUNCTION public.get_guest_orders(guest_id_param text)
RETURNS SETOF orders
SECURITY DEFINER
SET search_path = ''  -- This should appear before LANGUAGE
LANGUAGE plpgsql AS
$$
BEGIN
  RETURN QUERY 
  SELECT * 
  FROM public.orders 
  WHERE is_guest_order = true 
    AND guest_id = guest_id_param
    AND guest_id = current_setting('app.guest_id', true)::text;
END;
$$; 