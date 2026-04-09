-- Create blog_posts table for admin-managed blog content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index on published status and date for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (published = true);

-- Authenticated users can view all blog posts (for admin preview)
CREATE POLICY "Authenticated users can view all blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage all blog posts (admin only in practice)
CREATE POLICY "Authenticated users can manage blog posts"
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
