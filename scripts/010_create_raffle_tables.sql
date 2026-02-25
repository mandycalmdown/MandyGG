-- Raffle tickets table
CREATE TABLE IF NOT EXISTS public.raffle_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  thrill_username text NOT NULL,
  ticket_number text NOT NULL UNIQUE,
  raffle_date date NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  wager_amount numeric NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Raffle winners table
CREATE TABLE IF NOT EXISTS public.raffle_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.raffle_tickets(id) ON DELETE SET NULL,
  ticket_number text NOT NULL,
  thrill_username text NOT NULL,
  raffle_date date NOT NULL,
  prize_description text,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  announced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_date ON public.raffle_tickets(raffle_date);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user ON public.raffle_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_username ON public.raffle_tickets(thrill_username);
CREATE INDEX IF NOT EXISTS idx_raffle_winners_date ON public.raffle_winners(raffle_date);

-- Enable RLS
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raffle_tickets
CREATE POLICY "Users can view their own raffle tickets"
  ON public.raffle_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can view all raffle tickets"
  ON public.raffle_tickets FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert raffle tickets"
  ON public.raffle_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete raffle tickets"
  ON public.raffle_tickets FOR DELETE
  USING (true);

-- RLS Policies for raffle_winners
CREATE POLICY "Anyone can view raffle winners"
  ON public.raffle_winners FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage raffle winners"
  ON public.raffle_winners FOR ALL
  USING (true);
