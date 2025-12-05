-- Drop the existing policies if they exist
DROP POLICY IF EXISTS guest_orders_view_policy ON public.orders;
DROP POLICY IF EXISTS guest_orders_insert_policy ON public.orders;
DROP POLICY IF EXISTS guest_orders_update_policy ON public.orders;

-- Create an RLS policy for guest order viewing
CREATE POLICY guest_orders_view_policy ON public.orders
FOR SELECT
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Create an RLS policy for guest order insertion
CREATE POLICY guest_orders_insert_policy ON public.orders
FOR INSERT
WITH CHECK (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Create an RLS policy for guest order updates
CREATE POLICY guest_orders_update_policy ON public.orders
FOR UPDATE
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Make sure RLS is enabled on the table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY; 