-- Create the ledger_entries table for tracking seller balance
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subaccount_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  reference TEXT NOT NULL,
  description TEXT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ledger_entries_seller_id ON public.ledger_entries(seller_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_subaccount_code ON public.ledger_entries(subaccount_code);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_reference ON public.ledger_entries(reference);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type ON public.ledger_entries(type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created_at ON public.ledger_entries(created_at);

-- Add RLS policies
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all ledger entries
CREATE POLICY admin_ledger_entries_policy ON public.ledger_entries 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy for sellers to see only their own ledger entries
CREATE POLICY seller_ledger_entries_policy ON public.ledger_entries 
  FOR SELECT 
  TO authenticated 
  USING (seller_id = auth.uid());

-- Comment on table and columns
COMMENT ON TABLE public.ledger_entries IS 'Tracks credits and debits for seller accounts';
COMMENT ON COLUMN public.ledger_entries.id IS 'Unique identifier for the ledger entry';
COMMENT ON COLUMN public.ledger_entries.subaccount_code IS 'Paystack subaccount code';
COMMENT ON COLUMN public.ledger_entries.type IS 'Type of entry: credit or debit';
COMMENT ON COLUMN public.ledger_entries.amount IS 'Amount in kobo (smallest currency unit)';
COMMENT ON COLUMN public.ledger_entries.reference IS 'Reference ID for the transaction';
COMMENT ON COLUMN public.ledger_entries.description IS 'Description of the ledger entry';
COMMENT ON COLUMN public.ledger_entries.seller_id IS 'ID of the seller profile';
COMMENT ON COLUMN public.ledger_entries.created_at IS 'Timestamp when the entry was created';
COMMENT ON COLUMN public.ledger_entries.updated_at IS 'Timestamp when the entry was last updated'; 