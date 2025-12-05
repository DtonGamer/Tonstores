-- Add social media source column to orders table
ALTER TABLE public.orders ADD COLUMN social_media_source TEXT DEFAULT NULL;

-- Update RLS policies to allow read/write access for this new column
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow users to read their own catalogs orders' AND polrelid = 'public.orders'::regclass) THEN
    DROP POLICY "Allow users to read their own catalogs orders" ON public.orders;
  END IF;

  -- Create updated policy
  CREATE POLICY "Allow users to read their own catalogs orders" ON public.orders
    FOR SELECT
    USING (
      auth.uid() = (SELECT user_id FROM catalogs WHERE id = orders.catalog_id)
    );
END
$$;

-- Update order creation function if needed
CREATE OR REPLACE FUNCTION update_order_status() 
RETURNS TRIGGER AS $$
BEGIN
    -- Copy existing functionality
    -- Add timestamp to orders
    NEW.updated_at := now();
    
    -- Return the updated record
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN public.orders.social_media_source IS 'Tracks which social media platform referred the customer';
COMMENT ON TABLE public.orders IS 'Orders with updated social media tracking capabilities'; 