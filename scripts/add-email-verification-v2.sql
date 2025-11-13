-- Add verification and lock fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS thrill_username_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS thrill_username_locked BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_thrill_username ON profiles(thrill_username);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(thrill_username_verified);
