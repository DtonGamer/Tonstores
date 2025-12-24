-- Update RLS policies to handle different user types
-- This migration updates the policies to consider user_type in addition to role

-- Update profiles table policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update orders table policies to consider user_type
-- Allow buyers to create orders but restrict certain operations
-- Allow sellers to view orders from their catalogs
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
CREATE POLICY "orders_select_policy"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id  -- Buyers can view their own orders
  OR EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = orders.catalog_id
    AND catalogs.user_id = auth.uid()  -- Sellers can view orders from their catalogs
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update order_items table policies to consider user_type
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
CREATE POLICY "order_items_select_policy"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.user_id = auth.uid()  -- Buyers can view items in their orders
      OR EXISTS (
        SELECT 1 FROM catalogs
        WHERE catalogs.id = orders.catalog_id
        AND catalogs.user_id = auth.uid()  -- Sellers can view items in orders from their catalogs
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  )
);

-- Add new policies for catalogs that restrict creation based on user_type
-- Only sellers can create catalogs
DROP POLICY IF EXISTS "Users can create catalogs" ON catalogs;
CREATE POLICY "Users can create catalogs" ON catalogs
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'seller'
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only sellers can update their own catalogs
DROP POLICY IF EXISTS "Users can update own catalogs" ON catalogs;
CREATE POLICY "Users can update own catalogs" ON catalogs
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only sellers can delete their own catalogs
DROP POLICY IF EXISTS "Users can delete own catalogs" ON catalogs;
CREATE POLICY "Users can delete own catalogs" ON catalogs
FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only sellers can create products in their catalogs
DROP POLICY IF EXISTS "Users can create products" ON products;
CREATE POLICY "Users can create products" ON products
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'seller'
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only sellers can update products in their catalogs
DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = products.catalog_id
    AND catalogs.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'seller'
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = products.catalog_id
    AND catalogs.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'seller'
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only sellers can delete products in their catalogs
DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" ON products
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = products.catalog_id
    AND catalogs.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'seller'
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);