-- Add stock_quantity and low_stock_threshold columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER;

-- Update existing products to have default values
-- Set stock_quantity to 0 for products that are out of stock
-- Set stock_quantity to 10 for products that are in stock
-- Set low_stock_threshold to the default value of 5
UPDATE products
SET 
  stock_quantity = CASE 
    WHEN in_stock = TRUE THEN 10 
    ELSE 0 
  END,
  low_stock_threshold = 5
WHERE stock_quantity IS NULL;

-- Create an index on stock_quantity for faster queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Create a function to check for low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock falls below threshold and is greater than 0, it's low stock
  IF NEW.stock_quantity <= NEW.low_stock_threshold AND NEW.stock_quantity > 0 THEN
    -- You could potentially insert a notification record here
    -- or trigger other actions when stock becomes low
    
    -- Automatically update the in_stock status based on quantity
    IF NEW.stock_quantity <= 0 THEN
      NEW.in_stock = FALSE;
    ELSE
      NEW.in_stock = TRUE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the check_low_stock function when stock is updated
DROP TRIGGER IF EXISTS trg_check_low_stock ON products;
CREATE TRIGGER trg_check_low_stock
BEFORE UPDATE OF stock_quantity ON products
FOR EACH ROW
EXECUTE FUNCTION check_low_stock();

-- Create a view for easy access to low stock products
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

-- Add a notification preferences column to profiles table for stock alerts
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stock_alert_preferences JSONB DEFAULT '{"email": true, "dashboard": true}'::JSONB;

-- Comment on new columns
COMMENT ON COLUMN products.stock_quantity IS 'Current stock quantity of the product';
COMMENT ON COLUMN products.low_stock_threshold IS 'Threshold at which to trigger low stock warnings';
COMMENT ON COLUMN profiles.stock_alert_preferences IS 'User preferences for receiving stock alerts'; 