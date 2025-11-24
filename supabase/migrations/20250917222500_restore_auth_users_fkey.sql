-- Restore the original foreign key constraint to auth.users
-- This FK is needed for accessing email and other auth fields throughout the application

-- First drop the profiles FK we added
ALTER TABLE public.interest_expressions
DROP CONSTRAINT IF EXISTS interest_expressions_user_id_profiles_fkey;

-- Restore the original auth.users foreign key
ALTER TABLE public.interest_expressions
ADD CONSTRAINT interest_expressions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Keep the performance indexes we added
-- They are still useful regardless of which FK we use