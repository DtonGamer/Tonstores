-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Allow order status updates" ON orders;

-- Create policy to allow order status updates for all orders
-- This policy allows any authenticated or unauthenticated user to update order status
-- Note: In production, you may want to add additional security constraints
CREATE POLICY "Allow order status updates"
ON orders
FOR UPDATE 
USING (true)  -- Allow for all orders
WITH CHECK (
  -- Only allow updating these specific fields
  (
    NEW.status IN ('pending', 'paid', 'cancelled', 'failed') AND
    NEW.payment_status IN ('pending', 'paid', 'cancelled', 'failed')
  )
);

-- You might also need this policy for the webhook functions
CREATE POLICY "Allow webhook order status updates"
ON orders
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Add a trigger to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_logs (
    order_id,
    previous_status,
    new_status,
    previous_payment_status,
    new_payment_status,
    created_at
  ) VALUES (
    NEW.id,
    OLD.status,
    NEW.status,
    OLD.payment_status,
    NEW.payment_status,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the order_status_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  previous_status VARCHAR NOT NULL,
  new_status VARCHAR NOT NULL,
  previous_payment_status VARCHAR NOT NULL,
  new_payment_status VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add the trigger to the orders table
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE OF status, payment_status ON orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status)
EXECUTE FUNCTION log_order_status_change();

-- Comment for the policy
COMMENT ON POLICY "Allow order status updates" ON orders IS 'Allows updating order status regardless of authenticated user'; 