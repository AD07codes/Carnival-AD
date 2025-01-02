/*
  # Fix users table schema and trigger function

  1. Changes
    - Drop and recreate users table with proper sequence
    - Fix trigger function by properly dropping and recreating it
    - Add proper constraints and defaults
    
  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Drop existing trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing table and its dependencies
DROP TABLE IF EXISTS users CASCADE;

-- Create the sequence
CREATE SEQUENCE IF NOT EXISTS user_id_seq;

-- Recreate the users table with proper sequence
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  numeric_id bigint DEFAULT nextval('user_id_seq'),
  username text UNIQUE NOT NULL,
  game_id text,
  game_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on numeric_id
CREATE INDEX IF NOT EXISTS users_numeric_id_idx ON users(numeric_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create the trigger function
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, username, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email LIKE '%@admin.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
