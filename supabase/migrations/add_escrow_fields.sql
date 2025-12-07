-- Migration to add escrow fields to the orders table
-- This will enable payment escrow functionality

-- Add escrow_status column to orders table if it doesn't exist
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'held';

COMMENT ON COLUMN orders.escrow_status IS 'Escrow status: held, released, refunded';

-- Add release_date column to track when funds were released
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE;

-- Add a function to release funds after delivery confirmation
CREATE OR REPLACE FUNCTION release_funds_to_seller(order_id_param UUID)
RETURNS void AS $$
DECLARE
    order_record RECORD;
    seller_id UUID;
BEGIN
    -- Get the order details
    SELECT
        o.id,
        o.total_amount,
        o.user_id,
        o.escrow_status
    INTO order_record
    FROM orders o
    WHERE o.id = order_id_param;

    -- Check if the order exists and is eligible for release
    IF order_record IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Only allow release if the escrow status is 'held'
    IF order_record.escrow_status != 'held' THEN
        RAISE EXCEPTION 'Order escrow status is not held, cannot release funds';
    END IF;

    -- Update the order's escrow status and release date
    UPDATE orders
    SET
        escrow_status = 'released',
        release_date = NOW(),
        updated_at = NOW()
    WHERE id = order_id_param;

    -- Log the fund release in ledger if needed
    -- This would depend on the existing ledger implementation
    -- For now, we're just updating the order status

    RAISE NOTICE 'Funds released for order % to seller %', order_id_param, order_record.user_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to refund funds to the buyer
CREATE OR REPLACE FUNCTION refund_funds_to_buyer(order_id_param UUID)
RETURNS void AS $$
DECLARE
    order_record RECORD;
BEGIN
    -- Get the order details
    SELECT
        o.id,
        o.total_amount,
        o.escrow_status
    INTO order_record
    FROM orders o
    WHERE o.id = order_id_param;

    -- Check if the order exists and is eligible for refund
    IF order_record IS NULL THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Only allow refund if the escrow status is 'held'
    IF order_record.escrow_status != 'held' THEN
        RAISE EXCEPTION 'Order escrow status is not held, cannot refund funds';
    END IF;

    -- Update the order's escrow status
    UPDATE orders
    SET
        escrow_status = 'refunded',
        updated_at = NOW()
    WHERE id = order_id_param;

    -- Log the refund in ledger if needed
    RAISE NOTICE 'Funds refunded for order %', order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Update the RLS policy to include the new escrow status fields
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow order status updates from client" ON public.orders;

-- Create policy to allow order status updates for payment processing
-- This allows frontend client code to update order status during payment flows
CREATE POLICY "Allow order status updates from client"
ON public.orders
FOR UPDATE
USING (true)   -- allow attempts to update rows (further constraints in WITH CHECK)
WITH CHECK (
  (status IS NULL OR status IN ('pending','paid','cancelled','failed','processing','shipped','delivered','dispute')) AND
  (payment_status IS NULL OR payment_status IN ('pending','paid','cancelled','failed','refunded')) AND
  (escrow_status IS NULL OR escrow_status IN ('held','released','refunded'))
);

-- Create the appropriate RLS policy for allowing buyers to confirm delivery
-- The buyer is identified by their email matching the order's customer_email
DROP POLICY IF EXISTS "Allow buyer to update escrow status" ON public.orders;

CREATE POLICY "Allow buyer to update escrow status"
ON public.orders
FOR UPDATE
USING (
  auth.role() = 'authenticated'
  AND (auth.jwt() ->> 'email') = customer_email
  AND escrow_status = 'held'   -- existing row must be 'held'
)
WITH CHECK (
  escrow_status = 'released'
  AND status = 'delivered'
);