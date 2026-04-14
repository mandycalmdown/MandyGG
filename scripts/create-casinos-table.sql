-- Create casinos table for admin-managed casino cards
CREATE TABLE IF NOT EXISTS casinos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL,
  referral_url text NOT NULL,
  logo_url    text,
  sort_order  integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Seed with Thrill as the first entry
INSERT INTO casinos (name, description, referral_url, logo_url, sort_order, is_active)
VALUES (
  'Thrill',
  'Trustworthy, instant payouts, no KYC, no bullshit. The best crypto casino right now. use code MANDY for extra rewards, weekly race, and monthly poker.',
  'https://thrill.com/?r=MANDY',
  NULL,
  1,
  true
)
ON CONFLICT DO NOTHING;

-- RLS: public read, admin write enforced at API level
ALTER TABLE casinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "casinos_public_read" ON casinos
  FOR SELECT USING (is_active = true);

CREATE POLICY "casinos_service_all" ON casinos
  FOR ALL USING (true)
  WITH CHECK (true);
