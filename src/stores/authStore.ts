import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      }

      return {};
    } catch (error) {
      return { error };
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ 
          user: session.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          set({ 
            user: session.user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));