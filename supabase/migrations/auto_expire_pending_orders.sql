-- Migration to add automatic expiration of pending orders after 30 minutes
-- This will update both status and payment_status to 'failed' if the order remains in 'pending' state

-- Create a function to check and expire pending orders
CREATE OR REPLACE FUNCTION expire_pending_orders() RETURNS TRIGGER AS $$
BEGIN
  -- Check if the order has been in pending status for more than 30 minutes
  IF (NEW.status = 'pending' AND NEW.payment_status = 'pending' AND 
      (EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) > 1800)) THEN
    
    -- Update the order status to failed
    NEW.status := 'failed';
    NEW.payment_status := 'failed';
    NEW.updated_at := NOW();
    
    -- Add a note about the automatic expiration
    NEW.notes := COALESCE(NEW.notes, '') || 
                 CASE WHEN NEW.notes IS NULL OR NEW.notes = '' 
                      THEN '' 
                      ELSE E'\n' 
                 END || 
                 'Order automatically expired after 30 minutes in pending status.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function before any update to the orders table
DROP TRIGGER IF EXISTS check_pending_orders_trigger ON orders;
CREATE TRIGGER check_pending_orders_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION expire_pending_orders();

-- Create a scheduled function to periodically check for expired orders
-- This will run every 5 minutes to catch any orders that haven't been updated
CREATE OR REPLACE FUNCTION check_expired_pending_orders() RETURNS void AS $$
BEGIN
  UPDATE orders
  SET 
    status = 'failed',
    payment_status = 'failed',
    updated_at = NOW(),
    notes = COALESCE(notes, '') || 
            CASE WHEN notes IS NULL OR notes = '' 
                 THEN '' 
                 ELSE E'\n' 
            END || 
            'Order automatically expired after 30 minutes in pending status.'
  WHERE 
    status = 'pending' AND 
    payment_status = 'pending' AND
    EXTRACT(EPOCH FROM (NOW() - created_at)) > 1800;
END;
$$ LANGUAGE plpgsql;

-- Add notes column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comment on the new column
COMMENT ON COLUMN orders.notes IS 'Additional notes about the order, including automatic system messages';

-- Create a cron job to run the check_expired_pending_orders function every 5 minutes
-- Note: This requires pg_cron extension to be enabled on your Supabase instance
-- If pg_cron is not available, you'll need to implement this check in your application code
DO $$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Schedule the job
    PERFORM cron.schedule('check-expired-orders', '*/5 * * * *', 'SELECT check_expired_pending_orders()');
  ELSE
    -- Log a warning that pg_cron is not available
    RAISE NOTICE 'pg_cron extension is not available. You will need to implement order expiration checks in your application code.';
  END IF;
END $$; 