-- Fix for security_definer_view error
-- Recreate the low_stock_products view without SECURITY DEFINER (use SECURITY INVOKER which is the default)
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.*,
  c.name as catalog_name,
  c.user_id
FROM 
  products p
JOIN 
  catalogs c ON p.catalog_id = c.id
WHERE 
  p.stock_quantity <= p.low_stock_threshold 
  AND p.stock_quantity > 0;

-- Fix for function_search_path_mutable warning
-- Recreate the check_low_stock function with an explicit search_path
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock falls below threshold and is greater than 0, it's low stock
  IF NEW.stock_quantity <= NEW.low_stock_threshold AND NEW.stock_quantity > 0 THEN
    -- Automatically update the in_stock status based on quantity
    IF NEW.stock_quantity <= 0 THEN
      NEW.in_stock = FALSE;
    ELSE
      NEW.in_stock = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trg_check_low_stock ON products;
CREATE TRIGGER trg_check_low_stock
BEFORE UPDATE OF stock_quantity ON products
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Add track_inventory column to products table (from previous request)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE;

-- Update existing products to have default value for track_inventory
UPDATE products
SET track_inventory = FALSE
WHERE track_inventory IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.track_inventory IS 'Flag to indicate if inventory tracking is enabled for this product'; 