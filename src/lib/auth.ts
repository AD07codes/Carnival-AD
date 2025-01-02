import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
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

export async function signUp(email: string, password: string) {
  try {
    // First check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', email.split('@')[0])
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;

    // Wait briefly for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);

    let errorMessage = 'Failed to create account. Please try again.';
    if (error.response) {
      try {
        const errorData = await error.response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse error response JSON:', jsonError);
      }
    }

    return { 
      data: null, 
      error: {
        message: errorMessage
      }
    };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}
