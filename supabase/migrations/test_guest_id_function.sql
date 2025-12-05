-- Function to test and verify guest ID is properly set
CREATE OR REPLACE FUNCTION public.test_guest_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result RECORD;
  guest_id text;
BEGIN
  -- Get the current guest ID using our existing function
  guest_id := public.get_current_guest_id();
  
  -- Return the guest ID
  RETURN guest_id;
EXCEPTION WHEN OTHERS THEN
  -- Return error information for debugging
  RETURN format('Error: %s', SQLERRM);
END;
$$;

-- Add comment to explain the function
COMMENT ON FUNCTION public.test_guest_id() IS 'Test function that returns the current guest ID for debugging purposes'; 