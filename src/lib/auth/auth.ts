import { supabase } from '../supabase';
import { AuthResponse } from './types';
import { ensureUserProfile } from './utils';

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Ensure user profile exists
    if (data.user) {
      await ensureUserProfile(data.user.id, data.user.email || '');
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'Failed to sign in'
      }
    };
  }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Create user profile immediately after signup
    if (data.user) {
      await ensureUserProfile(data.user.id, email);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'Failed to create account'
      }
    };
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
