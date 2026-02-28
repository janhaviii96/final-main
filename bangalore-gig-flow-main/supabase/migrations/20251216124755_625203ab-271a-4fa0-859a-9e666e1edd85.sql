-- Create wallets table for bonus system
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  verification_bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "Users can view own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
ON public.wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
ON public.wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Add verification_status column to verifications for tracking overall status
-- Add is_identity_verified to profiles for quick badge lookup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_identity_verified BOOLEAN DEFAULT false;

-- Create trigger to update profiles when verification is approved
CREATE OR REPLACE FUNCTION public.update_profile_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.type IN ('aadhaar', 'face_scan') THEN
    -- Check if both aadhaar and face_scan are approved
    IF EXISTS (
      SELECT 1 FROM public.verifications 
      WHERE user_id = NEW.user_id 
      AND type = 'aadhaar' 
      AND status = 'approved'
    ) AND EXISTS (
      SELECT 1 FROM public.verifications 
      WHERE user_id = NEW.user_id 
      AND type = 'face_scan' 
      AND status = 'approved'
    ) THEN
      -- Update profile to verified
      UPDATE public.profiles SET is_identity_verified = true WHERE id = NEW.user_id;
      
      -- Award ₹30 bonus if not already claimed
      INSERT INTO public.wallets (user_id, balance, verification_bonus_claimed)
      VALUES (NEW.user_id, 30, true)
      ON CONFLICT (user_id) DO UPDATE 
      SET balance = wallets.balance + 30, verification_bonus_claimed = true
      WHERE wallets.verification_bonus_claimed = false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_verification_status_change ON public.verifications;
CREATE TRIGGER on_verification_status_change
  AFTER UPDATE OF status ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_verification_status();

-- Create unique constraint on verifications for user_id and type
CREATE UNIQUE INDEX IF NOT EXISTS verifications_user_type_idx ON public.verifications(user_id, type);