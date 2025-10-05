-- Add ticker customization settings table
CREATE TABLE IF NOT EXISTS ticker_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_color TEXT DEFAULT '#ffffff',
  background_color TEXT DEFAULT '#6366f1',
  background_gradient TEXT DEFAULT 'linear-gradient(to right, #6366f1, #a855f7, #6366f1)',
  speed INTEGER DEFAULT 8000,
  font_family TEXT DEFAULT 'inherit',
  font_size TEXT DEFAULT '1rem',
  font_weight TEXT DEFAULT 'bold',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticker_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read ticker settings
CREATE POLICY "Anyone can view ticker settings"
  ON ticker_settings
  FOR SELECT
  USING (true);

-- Allow authenticated users to manage ticker settings (for admin panel)
CREATE POLICY "Authenticated users can manage ticker settings"
  ON ticker_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default ticker settings
INSERT INTO ticker_settings (text_color, background_color, background_gradient, speed, font_family, font_size, font_weight) VALUES
  ('#ffffff', '#6366f1', 'linear-gradient(to right, #6366f1, #a855f7, #6366f1)', 8000, 'inherit', '1rem', 'bold')
ON CONFLICT DO NOTHING;
