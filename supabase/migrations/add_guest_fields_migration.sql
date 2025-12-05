-- Add guest order fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_guest_order BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_id TEXT;

-- Add index for faster guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id)
WHERE is_guest_order = true;

-- Add row-level security policy for guest orders
CREATE POLICY guest_orders_policy ON orders
FOR ALL
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  user_id = auth.uid()
); 