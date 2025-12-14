# Guest Orders Implementation Guide

This guide explains how to implement guest orders using UUID in the Tonstores Paystack integration.

## Overview

The guest order system allows users to place orders without creating an account. Each guest user receives a persistent UUID stored in localStorage, which is used to track their orders.

## Implementation Steps

### 1. Database Changes

Run the following SQL migrations to update your database schema:

```sql
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
```

Also create a PostgreSQL function to retrieve guest orders:

```sql
-- Function to get guest orders
CREATE OR REPLACE FUNCTION get_guest_orders(guest_id_param text)
RETURNS SETOF orders AS $$
BEGIN
  RETURN QUERY 
  SELECT * 
  FROM orders 
  WHERE is_guest_order = true 
    AND guest_id = guest_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Frontend Changes

#### Install UUID package
```bash
npm install uuid @types/uuid
```

#### Updated Code

The following files have been updated:

1. **src/hooks/useOrders.ts**
   - Updated to use UUID for guest ID generation
   - Added is_guest_order and guest_id fields to orders
   - Updated getUserOrders to handle guest orders

2. **src/hooks/usePaystackPayment.ts**
   - Added guest ID to payment metadata
   - Added is_guest_order flag to payment metadata

3. **netlify/functions/paystack-webhook.js**
   - Updated to handle guest orders in webhook
   - Added guest ID to order updates

### 3. Testing

To test the guest order system:

1. Clear localStorage and open the app in a private/incognito window
2. Add items to cart and complete checkout without login
3. Verify the order is created with guest_id and is_guest_order=true
4. Try accessing the order history with the same browser
5. Try completing a payment and ensure the webhook updates the order

### 4. Security Considerations

- Guest orders are only accessible via their unique guest_id
- RLS policies ensure guests can only view their own orders
- The function uses SECURITY DEFINER to ensure proper access control

## Troubleshooting

- If guest orders aren't visible, check the localStorage key "Tonstores-guest-id"
- Ensure the database function and RLS policies are properly configured
- Check for errors in the webhook logs when processing guest orders