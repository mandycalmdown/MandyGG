-- ============================================================
-- Weekly Raffle Migration
-- Changes: daily -> weekly (every Friday 00:00 UTC), $250 prize,
--          1 ticket per $500 wagered, raffle_week tracking
-- ============================================================

-- Add weekly columns to raffle_tickets
ALTER TABLE public.raffle_tickets
  ADD COLUMN IF NOT EXISTS raffle_week date, -- The Friday this ticket belongs to
  ADD COLUMN IF NOT EXISTS ticket_count integer NOT NULL DEFAULT 1;

-- Compute raffle_week from existing rows (backfill to nearest Friday)
UPDATE public.raffle_tickets
SET raffle_week = raffle_date + ((5 - EXTRACT(DOW FROM raffle_date)::int + 7) % 7) * INTERVAL '1 day'
WHERE raffle_week IS NULL;

-- Make raffle_week non-nullable going forward
ALTER TABLE public.raffle_tickets
  ALTER COLUMN raffle_week SET DEFAULT (
    -- Next Friday from current UTC date
    CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7) * INTERVAL '1 day'
  );

-- Add prize_amount to raffle_winners (was missing)
ALTER TABLE public.raffle_winners
  ADD COLUMN IF NOT EXISTS prize_amount numeric NOT NULL DEFAULT 250,
  ADD COLUMN IF NOT EXISTS winner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS winning_ticket_number text;

-- Raffle settings table — lets admin configure draw day/time and prize
CREATE TABLE IF NOT EXISTS public.raffle_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  prize_amount numeric NOT NULL DEFAULT 250,
  tickets_per_wager numeric NOT NULL DEFAULT 500, -- $500 wager = 1 ticket
  draw_day_utc integer NOT NULL DEFAULT 5,         -- 0=Sun … 5=Fri, 6=Sat
  draw_hour_utc integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default settings (upsert so re-running is safe)
INSERT INTO public.raffle_settings (id, prize_amount, tickets_per_wager, draw_day_utc, draw_hour_utc, is_active)
VALUES (1, 250, 500, 5, 0, true)
ON CONFLICT (id) DO UPDATE
  SET prize_amount      = EXCLUDED.prize_amount,
      tickets_per_wager = EXCLUDED.tickets_per_wager,
      draw_day_utc      = EXCLUDED.draw_day_utc,
      draw_hour_utc     = EXCLUDED.draw_hour_utc,
      updated_at        = now();

-- Enable RLS
ALTER TABLE public.raffle_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (prize amount shown publicly)
CREATE POLICY "Anyone can read raffle settings"
  ON public.raffle_settings FOR SELECT USING (true);

-- Only service role can modify
CREATE POLICY "Service role can manage raffle settings"
  ON public.raffle_settings FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_week ON public.raffle_tickets(raffle_week);
