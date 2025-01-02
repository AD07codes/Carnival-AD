// src/services/userService.js
import { supabase } from '../lib/supabaseClient'; // Assuming supabaseClient is in lib

export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, numeric_id, email, username, role')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      console.error('User profile not found');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};
