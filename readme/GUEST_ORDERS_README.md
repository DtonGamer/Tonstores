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

-- Create a secure function to set the app.guest_id session parameter
CREATE OR REPLACE FUNCTION public.set_app_guest_id(guest_id TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS
$$
BEGIN
  PERFORM set_config('app.guest_id', guest_id, FALSE);
END;
$$;

-- Create a secure function to get guest orders
CREATE OR REPLACE FUNCTION public.get_guest_orders(guest_id_param text)
RETURNS SETOF orders
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS
$$
BEGIN
  RETURN QUERY 
  SELECT * 
  FROM public.orders 
  WHERE is_guest_order = true 
    AND guest_id = guest_id_param
    AND guest_id = current_setting('app.guest_id', true)::text;
END;
$$;

-- Make sure the app.guest_id setting is available
ALTER DATABASE postgres SET app.guest_id TO NULL;

-- Drop any existing policies
DROP POLICY IF EXISTS guest_orders_view_policy ON public.orders;
DROP POLICY IF EXISTS guest_orders_insert_policy ON public.orders;
DROP POLICY IF EXISTS guest_orders_update_policy ON public.orders;

-- Create separate RLS policies for different operations
CREATE POLICY guest_orders_view_policy ON public.orders
FOR SELECT
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

CREATE POLICY guest_orders_insert_policy ON public.orders
FOR INSERT
WITH CHECK (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

CREATE POLICY guest_orders_update_policy ON public.orders
FOR UPDATE
USING (
  (is_guest_order = true AND guest_id = current_setting('app.guest_id', true)::text)
  OR
  (user_id = auth.uid())
);

-- Make sure RLS is enabled on the table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
```

### 2. Frontend Changes

#### Install UUID package
```bash
npm install uuid @types/uuid
```

#### Key Code Changes

1. **src/hooks/useOrders.ts**
   - Updated to use UUID for guest ID generation
   - Added is_guest_order and guest_id fields to orders
   - **Important**: Call `supabase.rpc('set_app_guest_id', { guest_id: guestId })` before any operation on guest orders
   - Updated all functions to set app.guest_id session parameter for RLS

2. **src/hooks/usePaystackPayment.ts**
   - Added guest ID to payment metadata
   - Added is_guest_order flag to payment metadata

3. **netlify/functions/paystack-webhook.js**
   - Updated to handle guest orders in webhook
   - Added guest ID to order updates

### 3. How RLS Works with Guest Orders

The key to making guest orders work with RLS is setting the `app.guest_id` session parameter before any database operations:

```typescript
// Before any database operation for guest users
if (isGuestOrder && guestId) {
  await supabase.rpc('set_app_guest_id', { guest_id: guestId });
}
```

This sets the PostgreSQL session variable that the RLS policy checks against.

### 4. SQL Function Security

The SQL functions are defined with these important security features:

1. `SECURITY DEFINER` - Ensures functions run with the privileges of the function creator
2. `SET search_path = ''` - Prevents search_path manipulation attacks
3. Fully qualified table names (`public.orders`) - Ensures specific tables are accessed

These measures protect against common function hijacking attacks.

### 5. Testing

To test the guest order system:

1. Clear localStorage and open the app in a private/incognito window
2. Add items to cart and complete checkout without login
3. Verify the order is created with guest_id and is_guest_order=true
4. Try accessing the order history with the same browser
5. Try completing a payment and ensure the webhook updates the order

### 6. Security Considerations

- Guest orders are only accessible via their unique guest_id
- The session parameter `app.guest_id` must be set before every operation on guest orders
- Separate RLS policies for SELECT, INSERT, and UPDATE operations provide fine-grained control
- Guest IDs are stored persistently in localStorage for the same user across sessions
- SQL functions use `SECURITY DEFINER` and empty search paths for protection

## Troubleshooting

- If you get "row violates row-level security policy" errors, ensure you're setting `app.guest_id` before database operations
- Check the browser's localStorage for "Tonstores-guest-id" to confirm the guest ID is being stored properly
- If orders aren't being created, check that the RLS policies are properly configured
- For webhook issues, check that guest_id is being properly included in the payment metadata 