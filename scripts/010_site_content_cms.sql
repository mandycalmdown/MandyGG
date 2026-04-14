-- Site Content CMS Tables
-- This creates the database structure for managing all site content from admin

-- =====================================================
-- GLOBAL SITE SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default global settings
INSERT INTO site_settings (key, value) VALUES
  ('brand', '{"site_name": "MANDY.GG", "tagline": "YEAH, I''M A GIRL AND I GAMBLE.", "referral_code": "MANDY", "referral_url": "https://thrill.com/?r=MANDY"}'),
  ('social_links', '{"telegram_chat": "https://t.me/mandyggchat", "telegram_channel": "https://t.me/mandygg", "discord": "https://discord.gg/mandygg", "kick": "https://kick.com/mandycalmdown", "twitter": "https://twitter.com/mandycalmdown", "support_bot": "https://t.me/mandysupport_bot"}'),
  ('effect_settings', '{"holo_text_src": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4", "holo_btn_webm": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm", "holo_btn_mp4": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4", "holo_bg_mp4": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4", "holo_wide_webm": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_WIDE-CNLyaOSVK5cArFRfu1FNHzb433j8iI.webm", "holo_wide_mp4": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_WIDE-RpqZaJvObzwBscZHWnnvAXCjgzTJWB.mp4", "primary_accent": "#5cfec0", "secondary_accent": "#3C7BFF", "glow_intensity": 1.0}')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- NAVIGATION ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'both')),
  sort_order INTEGER DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default nav items
INSERT INTO nav_items (label, href, location, sort_order, is_external) VALUES
  ('HOME', '/', 'header', 0, false),
  ('HOW TO', '/how-to-join', 'header', 1, false),
  ('REWARDS', '/rewards', 'header', 2, false),
  ('DEGEN DASHBOARD', '/dashboard', 'header', 3, false),
  ('LEADERBOARD', '/leaderboard', 'header', 4, false),
  ('RAFFLE', '/raffle', 'header', 5, false),
  ('GOSSIP', '/blog', 'header', 6, false),
  ('FAQ', '/#faq', 'header', 7, false),
  ('HOW TO JOIN', '/how-to-join', 'footer', 0, false),
  ('CASINOS', '/casinos', 'footer', 1, false),
  ('REWARDS', '/rewards', 'footer', 2, false),
  ('LEADERBOARD', '/leaderboard', 'footer', 3, false),
  ('RAFFLE', '/raffle', 'footer', 4, false),
  ('GOSSIP', '/blog', 'footer', 5, false),
  ('DEGEN DASHBOARD', '/dashboard', 'footer', 6, false),
  ('FAQ', '/#faq', 'footer', 7, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PAGE CONTENT (for page-specific sections)
-- =====================================================
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);

-- =====================================================
-- HOMEPAGE CONTENT
-- =====================================================
INSERT INTO page_content (page_slug, section_key, content, sort_order) VALUES
  ('homepage', 'hero', '{"title": "MANDY.GG", "tagline": "YEAH, I''M A GIRL AND I GAMBLE.", "use_holo_effect": true}', 0),
  ('homepage', 'updates_section', '{"title": "UPDATES", "use_holo_effect": true}', 1),
  ('homepage', 'blog_section', '{"title": "GAMBLING GOSSIP", "use_holo_effect": true}', 2),
  ('homepage', 'faq_section', '{"title": "F.A.Q.", "use_holo_effect": true}', 3)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- =====================================================
-- FEATURE CARDS (Homepage carousel)
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  button_label TEXT NOT NULL,
  button_href TEXT NOT NULL,
  is_external_link BOOLEAN DEFAULT FALSE,
  is_modal_trigger BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default feature cards
INSERT INTO feature_cards (title, description, image_url, button_label, button_href, is_external_link, is_modal_trigger, sort_order) VALUES
  ('$3500 WEEKLY RACE', 'JOIN THE RACE. USE CODE MANDY AND COMPETE FOR $3500 EVERY SINGLE WEEK.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-w5rK7kUzPbLQI1Y57CPnQijedQdozJ.webp', 'VIEW LEADERBOARD', '/leaderboard', false, false, 0),
  ('THRILL', 'PLAY AT THRILL WITH CODE MANDY. TRUSTWORTHY, INSTANT PAYOUTS, NO KYC, NO BULLSHIT.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_ACE_ELEMENT-6NYnjlUBlCmacbsg5OMtZQenj3ztWY.webp', 'PLAY AT THRILL', 'https://thrill.com/?r=MANDY', true, false, 1),
  ('WEEKLY RAFFLE', 'WAGER TO EARN TICKETS AND ENTER THE WEEKLY $250 PRIZE DRAW.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_RAFFLE_ELEMENT-lX6r2sI10WNpKSZ9wP94qoofPTmo2X.webp', 'VIEW RAFFLE', '/raffle', false, false, 2),
  ('GAMBLING GOSSIP', 'NEWS, DRAMA, CASINO REVIEWS, BLOGS AND THE STUFF ONLY DEGENS ARE TALKING ABOUT.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_MEGAPHONE_ELEMENT-lMEgz2xUs9EzL3ahx3hxQAM03Dy3N9.webp', 'READ MORE', '/blog', false, false, 3),
  ('REWARDS', 'SEE WHY PLAYING UNDER CODE MANDY PAYS BETTER. REWARDS, PERKS, CASHBACK, AND MORE.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_GIFTBOX_ELEMENT-WOlVpXW7THckXd3pgRCKF05UvepZtu.webp', 'VIEW REWARDS', '/rewards', false, false, 4),
  ('DEGEN DASHBOARD', 'TRACK YOUR STATS, RAFFLE TICKETS, POKER ELIGIBILITY, AND WEEKLY PROGRESS IN ONE PLACE.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TOOLS_ICON-NePfAoiUJsdObxpNYghwB6YkR9rz3I.webp', 'OPEN DASHBOARD', '/dashboard', false, false, 5),
  ('POKER NIGHT', 'MONTHLY VIP POKER GAME. $1000 PRIZE POOL. WAGER $50K MONTHLY TO QUALIFY.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POKER_CHIP_MANDYGG-fIvqIhEVsgRxMiDWG7fM6VkuB83oMD.webp', 'DETAILS', 'poker-modal', false, true, 6),
  ('CONNECT', 'JOIN THE TELEGRAM. UPDATES, GIVEAWAYS, SUPPORT, GOSSIP, AND GENERAL CHAOS.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHAT_BUBBLES-t5H6Ld4RrKgt95PbclU1Dq7o3AaquO.webp', 'JOIN TELEGRAM', 'https://t.me/mandyggchat', true, false, 7)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FAQ ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_html TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default FAQ items
INSERT INTO faq_items (question, answer, sort_order) VALUES
  ('HOW CAN I GET THE BEST CASINO BONUSES?', 'Sign up through Thrill.com with code MANDY for exclusive perks, weekly races, instant lossback, and VIP upgrades.', 0),
  ('WHAT''S THE BEST STAKE ALTERNATIVE?', 'Thrill offers the most generous bonuses and fastest payouts for crypto gamblers. You get extra rewards by joining with code MANDY.', 1),
  ('HOW DO I CONTACT YOU?', 'Join the official Telegram group first. If you can''t find your answer in the group, message the MandySupport bot. Please do not DM me personally: personal messages go straight to the archive so I will not see them.', 2),
  ('WHAT PERKS COME WITH CODE MANDY?', 'Weekly Leaderboard ($3,500 prize pool), Monthly Poker Tournament ($1,000 prize pool if you hit $50,000 monthly wagering), Lossback from day one, Custom High Roller Benefits, Wager Targets with cash bonuses, and Event notifications with cash prizes.', 3),
  ('WHAT CASINO IS THE BEST?', 'Currently your best option is Thrill. It''s new so they are eager and the bonuses are boosted, but it''s been well vetted and they are very reliable. Sign up with code MANDY.', 4),
  ('HOW DO I KNOW IF I USED CODE MANDY?', 'Ask support in the live chat or check your profile page. It will show "Referred by: mandycalmdown" but do it within 24 hours of signing up. After that, you can''t add or change a referral code.', 5),
  ('WHEN I GO TO THE CASINO WEBSITE IT SAYS MY LOCATION IS BLOCKED.', 'Many people prefer to keep their degen lives private and use a VPN to mask their location. Check out VPN tutorials online for guidance on getting started.', 6),
  ('ARE THESE CASINOS REAL? WILL THEY SCAM ME?', 'Any casino listed on Mandy.gg has been vetted by me. If you''re not breaking the terms of service or abusing promos or alts, you should have no issues withdrawing your winnings.', 7),
  ('I DON''T USE TELEGRAM. WHAT SHOULD I DO?', 'You should download Telegram and start using it if you don''t want to miss events or payouts for leaderboard wins. Right now, it''s the best way to communicate and connect with the community.', 8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- HOW TO JOIN PAGE STEPS
-- =====================================================
CREATE TABLE IF NOT EXISTS how_to_join_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  accent_color TEXT DEFAULT '#3C7BFF',
  image_url TEXT,
  image_alt TEXT,
  cta_label TEXT,
  cta_href TEXT,
  checks JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default How to Join steps
INSERT INTO how_to_join_steps (step_number, title, body, accent_color, image_url, image_alt, cta_label, cta_href, checks, sort_order) VALUES
  (1, 'Visit Thrill with Code MANDY', 'Click the button below to open Thrill.com. Make sure to use this specific link so you''re registered under code MANDY and eligible for all exclusive rewards.', '#3C7BFF', '/images/design-mode/MANDYGG_THRILL_SIGNIN(1).webp', 'Thrill.com homepage showing sign up button', 'Visit Thrill.com', 'https://thrill.com/?r=MANDY', '[{"icon": "check", "text": "Use the referral link to sign up"}, {"icon": "check", "text": "Must be 18 years or older to participate"}, {"icon": "check", "text": "Have a valid email address"}]', 0),
  (2, 'Complete Sign Up Process', 'Click the SIGN UP button and follow the registration process. Enter your email address and complete all required fields to create your account.', '#5ac3ff', '/images/design-mode/MANDYGG_THRILL_EMAIL(1).webp', 'Thrill sign up form with email input', NULL, NULL, '[{"icon": "check", "text": "Click \"SIGN UP\" in the top right corner"}, {"icon": "check", "text": "Enter your email and create a secure password"}, {"icon": "check", "text": "Complete all required registration fields"}]', 1),
  (3, 'Verify Your Referral Code', 'After signing up, click on your profile and verify that you are referred by mandycalmdown. This is crucial for reward eligibility.', '#3C7BFF', '/images/design-mode/MANDYGG_THRILL_PROFILE(1).webp', 'Thrill profile showing referred by mandycalmdown', NULL, NULL, '[{"icon": "check", "text": "Click on your profile icon in the top right"}, {"icon": "check", "text": "Look for \"Referred by mandycalmdown\" text"}, {"icon": "alert", "text": "If you don''t see this, contact support immediately"}]', 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PAGE-SPECIFIC CONTENT (other pages)
-- =====================================================
INSERT INTO page_content (page_slug, section_key, content, sort_order) VALUES
  ('blog', 'hero', '{"title": "GAMBLING GOSSIP", "subtitle": "Casino takes. No filter. Always honest.", "use_holo_effect": true}', 0),
  ('rewards', 'hero', '{"title": "REWARDS", "subtitle": "COMING SOON", "body": "Sorry, I have ADHD.", "body_secondary": "Exciting rewards are on the way. Stay tuned!", "use_holo_effect": true}', 0),
  ('casinos', 'hero', '{"title": "CASINOS", "subtitle": "True degenerates play on multiple platforms. Use the links below to play under my code.", "use_holo_effect": true}', 0),
  ('raffle', 'hero', '{"title": "WEEKLY RAFFLE", "subtitle": "EVERY FRIDAY · MIDNIGHT UTC · CODE: MANDY", "use_holo_effect": true}', 0),
  ('leaderboard', 'hero', '{"title": "WEEKLY RACE", "prize_amount": 3500, "subtitle": "CODE: MANDY ON THRILL", "use_holo_effect": true}', 0),
  ('how-to-join', 'hero', '{"title": "HOW TO JOIN", "subtitle": "Follow these steps to join Thrill.com with code MANDY and unlock exclusive rewards.", "use_holo_effect": true}', 0),
  ('how-to-join', 'notice', '{"title": "Critical: Verify Before Depositing", "body": "If your profile does not show \"Referred by mandycalmdown\" you MUST contact Thrill support before making any deposits or wagers. Otherwise you will not be under code MANDY and will not be eligible for any rewards, cash drops, or leaderboard prizes.", "body_secondary": "Contact support through the live chat option on the Thrill website."}', 1),
  ('how-to-join', 'cta', '{"title": "Ready to Get Started?", "subtitle": "Join the MANDY.GG community today and start earning exclusive rewards.", "button_label": "Join with Code MANDY", "button_href": "https://thrill.com/?r=MANDY"}', 2)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- =====================================================
-- FOOTER CONTENT
-- =====================================================
INSERT INTO page_content (page_slug, section_key, content, sort_order) VALUES
  ('global', 'footer', '{"brand_name": "MANDY.GG", "tagline": "YEAH, I''M A GIRL AND I GAMBLE.", "promo_text": "USE CODE MANDY ON THRILL", "copyright": "© 2026 MANDY.GG. ALL RIGHTS RESERVED.", "disclaimer": "Gambling involves risk. Never wager more than you can afford to lose. If gambling is affecting your life or the lives of those around you, please seek help.", "disclaimer_links": [{"label": "NCPG", "href": "https://www.ncpgambling.org"}, {"label": "BeGambleAware", "href": "https://www.begambleaware.org"}], "age_notice": "Must be 18+ (21+ where applicable) to participate. Mandy.GG is not a gambling operator.", "legal_links": [{"label": "PRIVACY", "href": "/privacy"}, {"label": "TERMS", "href": "/terms"}, {"label": "SUPPORT", "href": "https://t.me/mandysupport_bot"}]}', 0)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- =====================================================
-- LEADERBOARD SETTINGS
-- =====================================================
INSERT INTO page_content (page_slug, section_key, content, sort_order) VALUES
  ('leaderboard', 'settings', '{"weekly_prize_total": 3500, "prize_distribution": [1200, 900, 600, 300, 200, 120, 80, 50, 30, 20], "poker_requirement": 50000, "poker_prize_pool": 1000}', 0)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
CREATE POLICY "Authenticated users can manage site settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- nav_items
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view nav items" ON nav_items;
CREATE POLICY "Anyone can view nav items" ON nav_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage nav items" ON nav_items;
CREATE POLICY "Authenticated users can manage nav items" ON nav_items FOR ALL USING (auth.role() = 'authenticated');

-- page_content
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view page content" ON page_content;
CREATE POLICY "Anyone can view page content" ON page_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage page content" ON page_content;
CREATE POLICY "Authenticated users can manage page content" ON page_content FOR ALL USING (auth.role() = 'authenticated');

-- feature_cards
ALTER TABLE feature_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view feature cards" ON feature_cards;
CREATE POLICY "Anyone can view feature cards" ON feature_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage feature cards" ON feature_cards;
CREATE POLICY "Authenticated users can manage feature cards" ON feature_cards FOR ALL USING (auth.role() = 'authenticated');

-- faq_items
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view faq items" ON faq_items;
CREATE POLICY "Anyone can view faq items" ON faq_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage faq items" ON faq_items;
CREATE POLICY "Authenticated users can manage faq items" ON faq_items FOR ALL USING (auth.role() = 'authenticated');

-- how_to_join_steps
ALTER TABLE how_to_join_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view how to join steps" ON how_to_join_steps;
CREATE POLICY "Anyone can view how to join steps" ON how_to_join_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can manage how to join steps" ON how_to_join_steps;
CREATE POLICY "Authenticated users can manage how to join steps" ON how_to_join_steps FOR ALL USING (auth.role() = 'authenticated');
