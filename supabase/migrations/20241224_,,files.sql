-- =====================================================
-- SIMPLIFIED RLS POLICIES (No Anonymous Auth Needed)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- INSERT: Users can create their own orders
CREATE POLICY "orders_insert_policy"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECT: Users can view their own orders, sellers can view orders from their catalogs
CREATE POLICY "orders_select_policy"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = orders.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- UPDATE: Users and sellers can update orders
CREATE POLICY "orders_update_policy"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = orders.catalog_id 
    AND catalogs.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  status IN ('pending', 'paid', 'cancelled', 'failed', 'processing', 'shipped', 'delivered', 'dispute')
  AND payment_status IN ('pending', 'paid', 'cancelled', 'failed', 'refunded')
  AND (escrow_status IS NULL OR escrow_status IN ('held', 'released', 'refunded'))
);

-- DELETE: Only admins can delete orders
CREATE POLICY "orders_delete_policy"
ON orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- ORDER ITEMS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON order_items;

-- INSERT: Users can add items to their own orders
CREATE POLICY "order_items_insert_policy"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- SELECT: Users can view items in their orders
CREATE POLICY "order_items_select_policy"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM catalogs
        WHERE catalogs.id = orders.catalog_id 
        AND catalogs.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  )
);

-- UPDATE: Users can update items in their orders
CREATE POLICY "order_items_update_policy"
ON order_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
)
WITH CHECK (true);

-- DELETE: Only admins can delete order items
CREATE POLICY "order_items_delete_policy"
ON order_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- ESCROW TRANSACTIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "escrow_transactions_insert_policy" ON escrow_transactions;
DROP POLICY IF EXISTS "escrow_transactions_select_policy" ON escrow_transactions;
DROP POLICY IF EXISTS "escrow_transactions_update_policy" ON escrow_transactions;

CREATE POLICY "escrow_transactions_insert_policy"
ON escrow_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "escrow_transactions_select_policy"
ON escrow_transactions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "escrow_transactions_update_policy"
ON escrow_transactions FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (true);

-- =====================================================
-- INCOME SPLIT CONFIGS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "income_split_configs_insert_policy" ON income_split_configs;
DROP POLICY IF EXISTS "income_split_configs_select_policy" ON income_split_configs;
DROP POLICY IF EXISTS "income_split_configs_update_policy" ON income_split_configs;

CREATE POLICY "income_split_configs_insert_policy"
ON income_split_configs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_split_configs_select_policy"
ON income_split_configs FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "income_split_configs_update_policy"
ON income_split_configs FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (true);

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_split_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADD HELPFUL INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_catalog_id ON orders(catalog_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_user_id ON escrow_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_income_split_configs_user_id ON income_split_configs(user_id);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('orders', 'order_items', 'escrow_transactions', 'income_split_configs')
ORDER BY tablename, cmd;