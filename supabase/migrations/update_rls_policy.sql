-- Drop the existing policy if it exists
DROP POLICY IF EXISTS guest_orders_policy ON orders;

-- Create an RLS policy for guest order viewing
CREATE POLICY guest_orders_view_policy ON orders
FOR SELECT
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Create an RLS policy for guest order insertion
CREATE POLICY guest_orders_insert_policy ON orders
FOR INSERT
WITH CHECK (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Create an RLS policy for guest order updates
CREATE POLICY guest_orders_update_policy ON orders
FOR UPDATE
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Make sure RLS is enabled on the table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY; 