-- Simplified RLS policy for order status updates
-- This file contains the SQL needed to allow order status updates from client side
-- and from serverless functions

-- Enable RLS on the orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Allow order status updates from client" ON orders;
DROP POLICY IF EXISTS "Allow webhook order updates" ON orders;

-- Create policy to allow order status updates for payment processing
-- This allows frontend client code to update order status during payment flows
CREATE POLICY "Allow order status updates from client"
ON orders
FOR UPDATE 
USING (true)  -- Allow for all orders
WITH CHECK (
  -- Only allow updating specific status fields
  NEW.status IN ('pending', 'paid', 'cancelled', 'failed') AND
  NEW.payment_status IN ('pending', 'paid', 'cancelled', 'failed')
);

-- Create policy to allow all updates from server-side webhook functions
-- This uses Supabase service role authentication
CREATE POLICY "Allow webhook order updates"
ON orders
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index on transaction_reference field for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_reference
ON orders(transaction_reference);

-- Add a comment explaining the update policy
COMMENT ON POLICY "Allow order status updates from client" ON orders 
IS 'Allows clients to update order status during payment flows'; 