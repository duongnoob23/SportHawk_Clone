-- Fix foreign key constraint: currently points to auth.users, should point to profiles
-- This fixes the PostgREST relationship error when fetching interest expressions with user profiles

-- Drop the existing incorrect constraint
ALTER TABLE public.interest_expressions
DROP CONSTRAINT IF EXISTS interest_expressions_user_id_fkey;

-- Add the correct foreign key constraint pointing to profiles
ALTER TABLE public.interest_expressions
ADD CONSTRAINT interest_expressions_user_id_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_interest_expressions_user_id
ON public.interest_expressions(user_id);

-- Add index for common query pattern (team_id + interest_status)
CREATE INDEX IF NOT EXISTS idx_interest_expressions_team_status
ON public.interest_expressions(team_id, interest_status);