-- Create mailing_list table to store email subscriptions
CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'footer', -- 'footer' or 'signup'
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list(email);

-- Create index on source for analytics
CREATE INDEX IF NOT EXISTS idx_mailing_list_source ON mailing_list(source);
