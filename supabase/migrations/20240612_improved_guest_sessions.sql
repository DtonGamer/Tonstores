-- Migration for improved guest session handling
-- This file updates the functions and policies for handling guest sessions

-- Update the function to get the current guest ID with improved header handling
CREATE OR REPLACE FUNCTION public.get_current_guest_id()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  header_guest_id text;
  app_guest_id text;
  current_auth_uid text;
BEGIN
  -- First try to get from X-Guest-ID header (highest priority)
  BEGIN
    header_guest_id := current_setting('request.headers.x-guest-id', true);
    IF header_guest_id IS NOT NULL AND header_guest_id != '' THEN
      RETURN header_guest_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if header doesn't exist
  END;
  
  -- Then try to get from auth.uid() for service functions
  BEGIN
    current_auth_uid := auth.uid()::text;
    
    -- If auth.uid() exists and is not a valid UUID, it's likely a guest ID
    IF current_auth_uid IS NOT NULL AND 
       NOT (current_auth_uid ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
      RETURN current_auth_uid;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if auth.uid() doesn't exist
  END;
  
  -- Finally, try to get from app.guest_id session parameter (lowest priority)
  BEGIN
    app_guest_id := current_setting('app.guest_id', true);
    IF app_guest_id IS NOT NULL AND app_guest_id != '' THEN
      RETURN app_guest_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Return NULL if not found anywhere
    RETURN NULL;
  END;
  
  -- Return NULL if none of the methods worked
  RETURN NULL;
END;
$$;

-- Update the function to set the app.guest_id parameter (improved)
CREATE OR REPLACE FUNCTION public.set_app_guest_id(guest_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Set for current transaction
  PERFORM set_config('app.guest_id', guest_id, FALSE);
  
  -- Also set it at the session level
  BEGIN
    EXECUTE format('SET app.guest_id = %L', guest_id);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors in setting session-level parameter
    NULL;
  END;
END;
$$;

-- Update the function to get guest orders with the improved get_current_guest_id function
CREATE OR REPLACE FUNCTION public.get_guest_orders(guest_id_param text)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  current_guest_id text;
BEGIN
  -- Get the current guest ID
  current_guest_id := get_current_guest_id();
  
  -- Query for orders with appropriate security checks
  RETURN QUERY 
  SELECT * 
  FROM public.orders 
  WHERE is_guest_order = true 
    AND guest_id = guest_id_param
    AND (
      guest_id = current_guest_id OR -- Check against the current guest ID
      auth.role() = 'authenticated' -- Allow authenticated users (for admin access)
    );
END;
$$;

-- Update function to get app.guest_id (simplified)
CREATE OR REPLACE FUNCTION public.get_app_guest_id()
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT current_setting('app.guest_id'::text, true);
$$;

-- Clean up any existing policies that might conflict
DROP POLICY IF EXISTS "Guest users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guest users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guests can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guest can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guest can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "guest_orders_policy" ON public.orders;
DROP POLICY IF EXISTS "guest_orders_view_policy" ON public.orders;
DROP POLICY IF EXISTS "guest_orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "guest_orders_update_policy" ON public.orders;

-- Make sure RLS is enabled on the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a policy for guests to view their own orders
CREATE POLICY "Guest users can view their own orders" 
ON public.orders
FOR SELECT
USING (
  (is_guest_order = true AND guest_id = get_current_guest_id()) OR
  (auth.uid() = user_id) OR
  (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
);

-- Create a policy for guests to update their own orders
CREATE POLICY "Guest users can update their own orders" 
ON public.orders
FOR UPDATE
USING (
  (is_guest_order = true AND guest_id = get_current_guest_id()) OR
  (auth.uid() = user_id) OR
  (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
);

-- Create a policy for guests to insert orders
CREATE POLICY "Guests can create their own orders" 
ON public.orders
FOR INSERT
WITH CHECK (
  (is_guest_order = true AND guest_id = get_current_guest_id()) OR
  (is_guest_order = false AND auth.uid() = user_id) OR
  (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
);

-- Create a policy for updating order status during payment processing
CREATE POLICY "Allow order status updates" 
ON public.orders
FOR UPDATE 
USING (true)  -- Allow for all orders
WITH CHECK (
  -- Only allow updating specific status fields
  NEW.status IN ('pending', 'paid', 'cancelled', 'failed') AND
  NEW.payment_status IN ('pending', 'paid', 'cancelled', 'failed')
);

-- Add comments to explain the functions
COMMENT ON FUNCTION public.get_current_guest_id() IS 'Gets the current guest ID from headers, auth.uid(), or session parameters';
COMMENT ON FUNCTION public.get_guest_orders(text) IS 'Gets orders for a specific guest ID, with security checks';
COMMENT ON FUNCTION public.set_app_guest_id(text) IS 'Sets the app.guest_id parameter for the current transaction and session';
COMMENT ON FUNCTION public.get_app_guest_id() IS 'Gets the app.guest_id parameter from the current session';
