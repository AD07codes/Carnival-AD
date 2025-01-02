import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { signIn, signUp, signOut } from '../lib/auth/auth';
import { ensureUserProfile } from '../lib/auth/utils';

interface AuthUser extends User {
  numeric_id?: number;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchUser();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Ensure profile exists
      await ensureUserProfile(authUser.id, authUser.email || '');

      // Fetch user data
      const { data, error } = await supabase
        .from('users')
        .select('numeric_id, role')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUser({ ...authUser, numeric_id: data.numeric_id, role: data.role });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut: async () => {
      await signOut();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
