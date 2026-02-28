
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a policy that only allows users to view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a public view with only safe fields for other users
CREATE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT id, full_name, is_identity_verified, avatar_url
FROM public.profiles;

-- Allow authenticated users to read the public view
-- (security_invoker means RLS on base table applies, but we need a read policy for that)
-- Actually, security_invoker will use the calling user's permissions, which won't work
-- since they can only see their own row. Let's use security_barrier instead.
DROP VIEW IF EXISTS public.profiles_public;

-- Create a SECURITY DEFINER function to get public profile info
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, full_name text, is_identity_verified boolean, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.is_identity_verified, p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;
