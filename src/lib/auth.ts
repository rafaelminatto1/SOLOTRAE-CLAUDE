import { supabase } from './supabase';
import type { AuthResponse, AuthTokenResponse, User, Session } from '@supabase/supabase-js';

export const auth = {
  // Fazer login
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('🔑 [Auth] Tentando login com Supabase para:', email);
    
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔑 [Auth] Resultado do signInWithPassword:', {
        hasData: !!result.data,
        hasSession: !!result.data?.session,
        hasUser: !!result.data?.user,
        error: result.error?.message
      });
      
      return result;
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no signInWithPassword:', error);
      throw error;
    }
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
    console.log('🚪 [Auth] SignOut chamado');
    console.trace('🚪 [Auth] Stack trace do signOut:');
    
    try {
      const result = await supabase.auth.signOut();
      console.log('🚪 [Auth] Resultado do signOut:', {
        hasError: !!result.error,
        error: result.error?.message
      });
      return result;
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no signOut:', error);
      throw error;
    }
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
    console.log('👂 [Auth] Registrando listener de auth state change');
    
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('👂 [Auth] Auth state change detectado:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      callback(event, session);
    });
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