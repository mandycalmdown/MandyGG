-- Add PokerNow and Telegram username fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pokernow_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_pokernow_username ON profiles(pokernow_username);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_username ON profiles(telegram_username);

-- Add RLS policies for these fields
-- Users can read and update their own social usernames
CREATE POLICY IF NOT EXISTS "Users can update own social usernames"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
