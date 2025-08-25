import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { auth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { UserRole, User } from '@shared/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  register: (userData: { email: string; password: string; name: string; role: UserRole; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const getInitialSession = async () => {
      const { session } = await auth.getCurrentSession();
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        return { success: false, message: error.message || 'Erro ao fazer login' };
      }

      if (data.session) {
        setSession(data.session);
        if (data.session.user) {
          await loadUserProfile(data.session.user.id);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: UserRole; phone?: string }) => {
    try {
      const { data, error } = await auth.signUp(userData.email, userData.password, {
        name: userData.name,
        role: userData.role,
        phone: userData.phone
      });

      if (error) {
        return { success: false, message: error.message || 'Erro ao registrar usuário' };
      }

      // Criar perfil do usuário na tabela users
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone
          });

        if (profileError) {
          console.error('Erro ao criar perfil do usuário:', profileError);
          return { success: false, message: 'Erro ao criar perfil do usuário' };
        }
      }

      return { success: true, message: 'Usuário registrado com sucesso. Verifique seu email para confirmar a conta.' };
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        return { success: false, message: error.message || 'Erro ao fazer logout' };
      }

      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    return requiredRoles.includes(user.role);
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await auth.resetPassword(email);
      
      if (error) {
        return { success: false, message: error.message || 'Erro ao enviar email de recuperação' };
      }

      return { success: true, message: 'Email de recuperação enviado com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await auth.updatePassword(password);
      
      if (error) {
        return { success: false, message: error.message || 'Erro ao atualizar senha' };
      }

      return { success: true, message: 'Senha atualizada com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const value = {
    user,
    session,
    login,
    logout,
    register,
    isAuthenticated: !!user && !!session,
    isLoading,
    hasRole,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}