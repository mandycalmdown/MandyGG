-- Create announcements table for the ticker
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active announcements
CREATE POLICY "Anyone can view active announcements"
  ON announcements
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage announcements (for admin panel)
CREATE POLICY "Authenticated users can manage announcements"
  ON announcements
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default announcement about poker night
INSERT INTO announcements (message, is_active) VALUES
  ('🎰 Get your $50,000 wager in by Sunday''s deadline for Monthly Poker Night! 🃏 $1000 prize pool awaits!', true);
