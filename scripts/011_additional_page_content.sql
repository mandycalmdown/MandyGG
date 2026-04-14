-- Additional page content for all pages
-- This adds the missing page-specific content entries

-- Blog page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('blog', 'header', '{"title": "BLOG", "subtitle": "News, Updates & Guides", "use_video_text": true}', 0, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Rewards page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('rewards', 'header', '{"title": "REWARDS", "subtitle": "Coming Soon", "description": "Exciting rewards and benefits are on the way. Stay tuned!", "use_video_text": true}', 0, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Leaderboard page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('leaderboard', 'header', '{"title": "LEADERBOARD", "subtitle": "Weekly Wager Race", "use_video_text": true}', 0, true),
('leaderboard', 'prizes', '{"prizes": [5000, 2500, 1000, 750, 500, 250, 150, 100, 75, 50]}', 1, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Raffle page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('raffle', 'header', '{"title": "WEEKLY RAFFLE", "subtitle": "Win Big Every Week", "use_video_text": true}', 0, true),
('raffle', 'how_it_works', '{"title": "How It Works", "description": "Earn raffle tickets based on your wager amount. Every $100 wagered equals 1 ticket. The more you play, the better your chances!", "steps": ["Link your Thrill account", "Wager on supported platforms", "Earn tickets automatically", "Win weekly prizes"]}', 1, true),
('raffle', 'rules', '{"title": "Rules", "items": ["Must have a verified Thrill account linked", "Tickets are calculated from weekly wager", "Winners are drawn every Friday", "Prizes are distributed within 24 hours"]}', 2, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Casinos page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('casinos', 'header', '{"title": "CASINOS", "subtitle": "Play & Earn Rewards", "use_video_text": true}', 0, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- How to Join page content
INSERT INTO page_content (page_slug, section_key, content_data, order_index, is_visible) VALUES
('how-to-join', 'header', '{"title": "HOW TO JOIN", "subtitle": "Get Started in Minutes", "use_video_text": true}', 0, true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Add effect settings
INSERT INTO site_settings (setting_key, setting_value, setting_group, label, field_type) VALUES
('primary_glow_color', '#5cfec0', 'effects', 'Primary Glow Color', 'color'),
('secondary_glow_color', '#3C7BFF', 'effects', 'Secondary Glow Color', 'color'),
('hover_glow_color', '#ff94b4', 'effects', 'Hover Glow Color', 'color'),
('text_glow_intensity', '0.8', 'effects', 'Text Glow Intensity (0-1)', 'text'),
('border_glow_intensity', '0.5', 'effects', 'Border Glow Intensity (0-1)', 'text'),
('video_texture_url', '/videos/mandy-overlay.mp4', 'effects', 'Video Texture URL', 'url'),
('video_fallback_image', '/images/texture-fallback.jpg', 'effects', 'Video Fallback Image', 'url'),
('animation_speed', 'normal', 'effects', 'Animation Speed (slow/normal/fast)', 'text'),
('effects_enabled', 'true', 'effects', 'Enable Visual Effects', 'text')
ON CONFLICT (setting_key) DO NOTHING;

-- Add more global settings
INSERT INTO site_settings (setting_key, setting_value, setting_group, label, field_type) VALUES
('hero_cta_secondary_text', 'Learn More', 'homepage', 'Hero Secondary CTA Text', 'text'),
('hero_cta_secondary_url', '/how-to-join', 'homepage', 'Hero Secondary CTA URL', 'url'),
('updates_section_title', 'LATEST UPDATES', 'homepage', 'Updates Section Title', 'text'),
('faq_section_title', 'FREQUENTLY ASKED QUESTIONS', 'homepage', 'FAQ Section Title', 'text'),
('features_section_title', 'WHY MANDY.GG?', 'homepage', 'Features Section Title', 'text')
ON CONFLICT (setting_key) DO NOTHING;

-- Add footer link groups
INSERT INTO nav_items (nav_location, label, url, order_index, is_visible, open_in_new_tab, icon_name) VALUES
('footer_links', 'Home', '/', 0, true, false, null),
('footer_links', 'Leaderboard', '/leaderboard', 1, true, false, null),
('footer_links', 'Raffle', '/raffle', 2, true, false, null),
('footer_links', 'How to Join', '/how-to-join', 3, true, false, null),
('footer_links', 'Blog', '/blog', 4, true, false, null),
('footer_legal', 'Privacy Policy', '/privacy', 0, true, false, null),
('footer_legal', 'Terms of Service', '/terms', 1, true, false, null)
ON CONFLICT DO NOTHING;
