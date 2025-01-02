/*
  # Fix user schema and relationships

  1. Changes
    - Add game_id column to users table
    - Safely migrate user_id from bigint to uuid in tournament_participants
    - Add proper foreign key constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Add game_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS game_id TEXT;

-- Safe conversion of user_id from bigint to uuid
-- 1. Add temporary UUID column
ALTER TABLE tournament_participants 
  ADD COLUMN user_id_uuid uuid;

-- 2. Create a function to convert bigint to uuid string
CREATE OR REPLACE FUNCTION bigint_to_uuid(bigint_id bigint) 
RETURNS uuid AS $$
BEGIN
  -- Convert the bigint to a string and pad with zeros if needed
  RETURN CAST(LPAD(bigint_id::text, 32, '0') AS uuid);
END;
$$ LANGUAGE plpgsql;

-- 3. Update the temporary column with converted values
UPDATE tournament_participants 
SET user_id_uuid = bigint_to_uuid(user_id::bigint);

-- 4. Drop the old column and rename the new one (split into separate statements)
ALTER TABLE tournament_participants DROP COLUMN user_id;
ALTER TABLE tournament_participants ALTER COLUMN user_id_uuid SET NOT NULL;
ALTER TABLE tournament_participants RENAME COLUMN user_id_uuid TO user_id;

-- 5. Add foreign key constraint
ALTER TABLE tournament_participants 
  ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 6. Clean up the conversion function
DROP FUNCTION bigint_to_uuid;
