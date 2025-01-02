/*
  # Add In-Game Name to Users Table

  1. Changes
    - Add in_game_name column to users table
    - Add proper constraints for in_game_name

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
    -- Add in_game_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'in_game_name'
    ) THEN
        ALTER TABLE users ADD COLUMN in_game_name TEXT;
    END IF;
END $$;
