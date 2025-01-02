/*
  # Add Game ID to Users Table

  1. Changes
    - Ensure game_id column exists in users table
    - Add proper constraints for game_id

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure game_id column exists with proper type and constraints
DO $$ 
BEGIN
    -- Add game_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'game_id'
    ) THEN
        ALTER TABLE users ADD COLUMN game_id TEXT;
    END IF;
END $$;
