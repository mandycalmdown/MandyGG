-- Create advent_opens table to track which users opened which days
CREATE TABLE IF NOT EXISTS advent_opens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day >= 1 AND day <= 24),
  opened_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, day)
);

-- Enable RLS
ALTER TABLE advent_opens ENABLE ROW LEVEL SECURITY;

-- Users can view their own opens
CREATE POLICY "Users can view own advent opens" ON advent_opens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own opens
CREATE POLICY "Users can insert own advent opens" ON advent_opens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can view all opens (for admin dashboard)
CREATE POLICY "Service role can view all advent opens" ON advent_opens
  FOR SELECT USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advent_opens_user_id ON advent_opens(user_id);
CREATE INDEX IF NOT EXISTS idx_advent_opens_day ON advent_opens(day);
