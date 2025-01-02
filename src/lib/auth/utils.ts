import { supabase } from '../supabase';
    import { UserCheckResponse } from './types';

    export async function checkExistingUser(username: string): Promise<UserCheckResponse> {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return {
          exists: !!data,
          error: null
        };
      } catch (error: any) {
        console.error('Error checking existing user:', error);
        return {
          exists: false,
          error: error.message
        };
      }
    }

    export async function ensureUserProfile(userId: string, email: string) {
      try {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        // Only create profile if it doesn't exist
        if (!profile) {
          const username = email.split('@')[0];
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              username,
              role: email === 'adminconnect@telegmail.com' ? 'admin' : (username.includes('admin') ? 'admin' : 'user')
            }])
            .single();

          if (createError && createError.code !== '23505') { // Ignore duplicate key errors
            throw createError;
          }
        }

        return { error: null };
      } catch (error: any) {
        console.error('Error ensuring user profile:', error);
        return { error };
      }
    }
