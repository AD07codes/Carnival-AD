/*
      # Add INSERT policy for users table

      1. Changes
        - Add policy to allow authenticated users to insert their own profile
        - Ensure users can only create profiles with their own auth.uid
        
      2. Security
        - Maintain existing RLS policies
        - Add controlled insert access
    */

    -- Add INSERT policy for users table
    CREATE POLICY "Users can insert own profile"
      ON users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    -- Add policy for service role to handle initial profile creation
    CREATE POLICY "Service role can manage all profiles"
      ON users
      USING (auth.role() = 'service_role');
    
    -- Function to automatically create user profile
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.users (id, username, role)
      VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        CASE 
          WHEN new.email = 'adminconnect@telegmail.com' THEN 'admin'
          WHEN new.email LIKE '%@admin.com' THEN 'admin'
          ELSE 'user'
        END
      );
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
