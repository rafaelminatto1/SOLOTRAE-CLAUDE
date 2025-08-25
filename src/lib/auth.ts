import { supabase } from './supabase';
import type { AuthResponse, AuthTokenResponse, User, Session } from '@supabase/supabase-js';

export const auth = {
  // Fazer login
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  // Registrar usuário
  signUp: async (email: string, password: string, metadata?: any): Promise<AuthResponse> => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  // Fazer logout
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Obter sessão atual
  getCurrentSession: async () => {
    const { data } = await supabase.auth.getSession();
    return { session: data.session };
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return { user: data.user };
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Redefinir senha
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  },

  // Atualizar senha
  updatePassword: async (password: string) => {
    return await supabase.auth.updateUser({ password });
  },

  // Atualizar usuário
  updateUser: async (attributes: { email?: string; password?: string; data?: any }) => {
    return await supabase.auth.updateUser(attributes);
  },

  // Refresh token
  refreshSession: async (): Promise<AuthTokenResponse> => {
    return await supabase.auth.refreshSession();
  }
};

export default auth;