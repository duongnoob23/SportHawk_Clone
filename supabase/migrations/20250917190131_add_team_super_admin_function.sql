-- Add function to check if a user is a Super Admin for a specific team
-- This checks the is_primary field in the team_admins table
-- A Super Admin is the primary administrator who can manage other admins

-- Drop existing overloaded functions if they exist (these don't check team context)
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS is_super_admin(user_id uuid);

-- Create new function that checks team-specific super admin status
CREATE OR REPLACE FUNCTION is_super_admin(team_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM team_admins
    WHERE team_id = team_uuid
    AND user_id = user_uuid
    AND is_primary = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin(uuid, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION is_super_admin(uuid, uuid) IS
'Checks if a user is a Super Admin (primary admin) for a specific team. Super Admins have the is_primary flag set to true in the team_admins table.';

-- Also create a function for checking if current user is super admin for a team
CREATE OR REPLACE FUNCTION current_user_is_super_admin(team_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM team_admins
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND is_primary = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION current_user_is_super_admin(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION current_user_is_super_admin(uuid) IS
'Checks if the currently authenticated user is a Super Admin for a specific team.';

-- Update existing RLS policies for team_admins table to use the new function
-- Policy: Super Admins can delete other admins (except themselves)
DROP POLICY IF EXISTS "Super admins can delete other admins" ON team_admins;
CREATE POLICY "Super admins can delete other admins"
ON team_admins
FOR DELETE
USING (
  -- Must be super admin of the team
  current_user_is_super_admin(team_id)
  AND
  -- Cannot delete self
  user_id != auth.uid()
  AND
  -- Cannot delete other super admins
  is_primary != true
);

-- Policy: Team admins can add new admins
DROP POLICY IF EXISTS "Team admins can add new admins" ON team_admins;
CREATE POLICY "Team admins can add new admins"
ON team_admins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_admins
    WHERE team_admins.team_id = team_admins.team_id
    AND team_admins.user_id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_admins_is_primary
ON team_admins(team_id, user_id, is_primary)
WHERE is_primary = true;

-- Verify the team_admins table has the required columns
DO $$
BEGIN
  -- Check if is_primary column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_admins'
    AND column_name = 'is_primary'
  ) THEN
    -- Add is_primary column if it doesn't exist
    ALTER TABLE team_admins
    ADD COLUMN is_primary boolean DEFAULT false;

    -- Update the first admin of each team to be the super admin
    UPDATE team_admins
    SET is_primary = true
    WHERE (team_id, created_at) IN (
      SELECT team_id, MIN(created_at)
      FROM team_admins
      GROUP BY team_id
    );
  END IF;
END
$$;