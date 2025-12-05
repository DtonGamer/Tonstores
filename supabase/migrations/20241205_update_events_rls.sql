-- Function to get the current guest ID from the request headers or session
CREATE OR REPLACE FUNCTION get_current_guest_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    guest_id TEXT;
BEGIN
    -- Try to get the custom header first
    guest_id := current_setting('request.headers.x-guest-id', true);

    -- If not found in headers, try session parameter
    IF guest_id IS NULL OR guest_id = '' THEN
        guest_id := current_setting('app.guest_id', true);
    END IF;

    RETURN guest_id;
END;
$$;

-- Update RLS policy to handle both authenticated users tracking their own events
-- and system events (user_id = NULL)
DROP POLICY IF EXISTS "Users can insert events" ON events;
CREATE POLICY "Users can insert events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = user_id)  -- Authenticated users can only add events for themselves
    OR
    (user_id IS NULL)  -- Authenticated users can add system events (user_id = NULL)
  );

-- Create policy for anon users to add system events (user_id = NULL)
DROP POLICY IF EXISTS "Allow system events" ON events;
CREATE POLICY "Allow system events" ON events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Policy for authenticated users to view their own events
DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR user_id IS NULL  -- Allow viewing system events too
  );

-- Create separate policy for anon users to have limited access to system events only
CREATE POLICY "Anonymous users can view system events" ON events
  FOR SELECT TO anon
  USING (user_id IS NULL);