-- Create table to track qualified players for each poker night
CREATE TABLE IF NOT EXISTS poker_qualifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thrill_username TEXT NOT NULL,
  display_name TEXT,
  monthly_wager NUMERIC NOT NULL,
  qualification_date TIMESTAMPTZ NOT NULL,
  poker_night_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, poker_night_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_poker_qualifiers_poker_night_date ON poker_qualifiers(poker_night_date);
CREATE INDEX IF NOT EXISTS idx_poker_qualifiers_user_id ON poker_qualifiers(user_id);

-- Enable RLS
ALTER TABLE poker_qualifiers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own qualifications
CREATE POLICY "Users can view own qualifications"
  ON poker_qualifiers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert qualifications
CREATE POLICY "Service role can insert qualifications"
  ON poker_qualifiers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can view all qualifications
CREATE POLICY "Service role can view all qualifications"
  ON poker_qualifiers
  FOR SELECT
  USING (true);
