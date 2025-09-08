import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as CustomUser } from '@shared/types';

export type User = SupabaseUser & CustomUser;

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
          user: data.user as User, 
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
      // Tentar logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('⚠️ [AuthStore] Erro no logout do Supabase, fazendo logout local:', error.message);
        // Fallback: logout local mesmo com erro da API
      } else {
        console.log('✅ [AuthStore] Logout do Supabase bem-sucedido');
      }
      
      // Sempre limpar estado local, independente do resultado da API
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
      
      // Limpar localStorage/sessionStorage se houver dados salvos
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ [AuthStore] Erro ao limpar storage:', storageError);
      }
      
    } catch (error) {
      console.error('❌ [AuthStore] Erro inesperado no logout, fazendo logout local:', error);
      
      // Fallback: sempre limpar estado local mesmo com erro de rede
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
      
      // Limpar storage local
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ [AuthStore] Erro ao limpar storage no fallback:', storageError);
      }
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({ 
          user: session.user as User, 
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
            user: session.user as User, 
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