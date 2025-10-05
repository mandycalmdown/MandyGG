-- Add PokerNow and Telegram username fields to profiles table
-- Version 2: Ensures columns are added correctly

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pokernow_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_pokernow_username ON profiles(pokernow_username);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_username ON profiles(telegram_username);

-- Add RLS policies for these fields
-- Users can read and update their own social usernames
DROP POLICY IF EXISTS "Users can update own social usernames" ON profiles;

CREATE POLICY "Users can update own social usernames"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to read all profiles (for leaderboard and admin)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);
