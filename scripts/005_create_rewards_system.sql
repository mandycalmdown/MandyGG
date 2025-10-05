-- Create rewards table to store available rewards
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    point_value NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_rewards table to track rewards granted to users
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    date_granted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reward_id, date_granted)
);

-- Add total_prizes column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'total_prizes'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN total_prizes NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_id ON public.user_rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_rewards_name ON public.rewards(name);

-- Enable Row Level Security
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for rewards table
CREATE POLICY "Anyone can view rewards"
    ON public.rewards FOR SELECT
    USING (true);

CREATE POLICY "Only authenticated users can insert rewards"
    ON public.rewards FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update rewards"
    ON public.rewards FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create policies for user_rewards table
CREATE POLICY "Users can view their own rewards"
    ON public.user_rewards FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can grant rewards"
    ON public.user_rewards FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create function to update total_prizes when rewards are granted
CREATE OR REPLACE FUNCTION update_user_total_prizes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET total_prizes = (
        SELECT COALESCE(SUM(r.point_value), 0)
        FROM public.user_rewards ur
        JOIN public.rewards r ON ur.reward_id = r.id
        WHERE ur.user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update total_prizes
DROP TRIGGER IF EXISTS trigger_update_total_prizes ON public.user_rewards;
CREATE TRIGGER trigger_update_total_prizes
    AFTER INSERT OR DELETE ON public.user_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_user_total_prizes();

-- Insert some default rewards
INSERT INTO public.rewards (name, description, point_value) VALUES
    ('Weekly Winner', 'Won the weekly leaderboard competition', 100),
    ('Top 10 Finish', 'Finished in the top 10 of the leaderboard', 50),
    ('Poker Night Qualifier', 'Qualified for the monthly poker tournament', 1000),
    ('High Roller', 'Wagered over $100,000 in a single week', 250),
    ('Consistency Bonus', 'Participated in 4 consecutive weeks', 75)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.rewards IS 'Stores available rewards and their point values';
COMMENT ON TABLE public.user_rewards IS 'Tracks which rewards have been granted to which users';
COMMENT ON COLUMN public.profiles.total_prizes IS 'Total prize value accumulated by the user';
