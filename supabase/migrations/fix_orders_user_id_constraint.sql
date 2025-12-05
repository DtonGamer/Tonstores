-- Make user_id field nullable for guest orders
ALTER TABLE orders
ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id or guest_id is present
ALTER TABLE orders
ADD CONSTRAINT check_user_or_guest 
CHECK (
  (user_id IS NOT NULL AND is_guest_order = false) 
  OR 
  (guest_id IS NOT NULL AND is_guest_order = true)
);

-- Make sure we have appropriate indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update existing RLS policy to properly handle null user_id
DROP POLICY IF EXISTS guest_orders_policy ON orders;

CREATE POLICY guest_orders_policy ON orders
FOR ALL
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (is_guest_order = false AND user_id = auth.uid())
); 