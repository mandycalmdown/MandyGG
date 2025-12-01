-- Create advent_gifts table for storing daily gift content
CREATE TABLE IF NOT EXISTS advent_gifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day integer NOT NULL UNIQUE CHECK (day >= 1 AND day <= 24),
  title text NOT NULL DEFAULT 'Holiday Surprise!',
  description text NOT NULL DEFAULT 'A special treat awaits you!',
  reward text NOT NULL DEFAULT 'Coming soon...',
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE advent_gifts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view gifts (for the public advent calendar)
CREATE POLICY "Anyone can view advent gifts" ON advent_gifts
  FOR SELECT USING (true);

-- Only authenticated users can manage gifts (admins)
CREATE POLICY "Authenticated users can manage advent gifts" ON advent_gifts
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default data for all 24 days
INSERT INTO advent_gifts (day, title, description, reward) VALUES
  (1, 'Welcome Gift!', 'Start the holidays right with this special welcome bonus!', '10% Rakeback Boost'),
  (2, 'Lucky Day 2', 'Your second holiday treat is here!', 'Free Spin Token'),
  (3, 'Triple Treat', 'Three days in, triple the fun!', '$5 Bonus Credit'),
  (4, 'Festive Four', 'Keep the holiday spirit going!', '15% Deposit Match'),
  (5, 'High Five!', 'Celebrate with this mid-week reward!', 'Mystery Box'),
  (6, 'Sweet Six', 'Something sweet for day six!', 'VIP Points Boost'),
  (7, 'Lucky Seven', 'Seven is your lucky number today!', '$10 Free Play'),
  (8, 'Great Eight', 'Eight days of amazing gifts!', '20% Cashback'),
  (9, 'Cloud Nine', 'Floating on cloud nine with this reward!', 'Exclusive Badge'),
  (10, 'Perfect Ten', 'A perfect gift for day ten!', '$15 Bonus'),
  (11, 'Make a Wish', 'Eleven wishes coming true!', 'Spin the Wheel'),
  (12, 'Dozen Delights', 'A dozen reasons to celebrate!', '25% Rakeback'),
  (13, 'Lucky 13', 'Turn luck into rewards!', '$20 Free Credit'),
  (14, 'Halfway There!', 'Halfway through the advent adventure!', 'Double XP Day'),
  (15, 'Festive Fifteen', 'Fifteen days of holiday magic!', 'Premium Loot Box'),
  (16, 'Sweet Sixteen', 'A sweet gift for day sixteen!', '$25 Bonus'),
  (17, 'Holiday Cheer', 'Spreading holiday cheer your way!', '30% Deposit Boost'),
  (18, 'Winter Wonderland', 'A winter wonderland of rewards!', 'Exclusive Merch Entry'),
  (19, 'Countdown Begins', 'The big day is near!', '$30 Free Play'),
  (20, 'Almost There', 'So close to Christmas!', 'VIP Upgrade'),
  (21, 'Winter Solstice', 'The longest night, the biggest reward!', '50% Cashback'),
  (22, 'Two Days Left', 'The excitement is building!', '$40 Bonus Credit'),
  (23, 'Christmas Eve Eve', 'One more sleep until Christmas Eve!', 'Mystery Grand Prize Entry'),
  (24, 'Christmas Eve Special', 'The ultimate holiday gift awaits!', 'GRAND PRIZE - $500 Bonus!')
ON CONFLICT (day) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_advent_gifts_day ON advent_gifts(day);
