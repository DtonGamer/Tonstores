-- Create events table for tracking user behavior and system events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be null for system events
  session_id text, -- To group events from the same session
  event_type text NOT NULL, -- e.g., 'catalog_viewed', 'product_added_to_cart', 'checkout_initiated', 'payment_completed'
  event_data jsonb DEFAULT '{}', -- Additional event-specific data
  source text DEFAULT 'frontend', -- 'frontend', 'backend', 'system'
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their own events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow inserting events
CREATE POLICY "Users can insert events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow inserting system events (user_id IS NULL)
CREATE POLICY "Allow system events" ON events
  FOR INSERT TO authenticated, anon
  WITH CHECK (user_id IS NULL);

-- Create policy to allow service role to insert system events
CREATE POLICY "Service role can insert system events" ON events
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events (user_id);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON events (event_type);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON events (created_at);
CREATE INDEX IF NOT EXISTS events_session_id_idx ON events (session_id);
CREATE INDEX IF NOT EXISTS events_source_idx ON events (source);