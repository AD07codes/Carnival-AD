/*
  # Fix user registration flow

  1. Changes
    - Drop and recreate user profile trigger with better error handling
    - Add default username generation
    - Ensure proper constraint handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_base TEXT;
  username_attempt TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base username from email
  username_base := split_part(new.email, '@', 1);
  username_attempt := username_base;
  
  -- Try to insert with incrementing counter if username exists
  WHILE counter < 1000 LOOP
    BEGIN
      INSERT INTO public.users (id, username, role)
      VALUES (
        new.id,
        username_attempt,
        CASE 
          WHEN new.email LIKE '%@admin.com' THEN 'admin'
          ELSE 'user'
        END
      );
      RETURN new;
    EXCEPTION 
      WHEN unique_violation THEN
        counter := counter + 1;
        username_attempt := username_base || counter::text;
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
    END;
  END LOOP;
  
  RAISE EXCEPTION 'Could not generate unique username';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;
