-- Create updates table for homepage update feed
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'megaphone',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on active status for filtering
CREATE INDEX IF NOT EXISTS idx_updates_active ON public.updates(is_active, created_at DESC);

-- Enable RLS
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active updates
CREATE POLICY "Anyone can view active updates"
  ON public.updates
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage all updates
CREATE POLICY "Authenticated users can manage updates"
  ON public.updates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
