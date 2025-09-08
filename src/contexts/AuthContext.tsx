import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  refreshSession: () => Promise<{ success: boolean; message?: string }>;
  isSessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Função para verificar se a sessão está válida
  const checkSessionValidity = useCallback((currentSession: Session | null): boolean => {
    if (!currentSession) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = currentSession.expires_at || 0;
    
    // Considera válida se ainda tem pelo menos 5 minutos antes de expirar
    return expiresAt > (now + 300);
  }, []);

  // Função para agendar refresh automático
  const scheduleTokenRefresh = useCallback((session: Session) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Agenda refresh para 5 minutos antes da expiração
    const refreshTime = Math.max(0, (expiresAt - now - 300) * 1000);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      if (!isRefreshingRef.current) {
        await refreshSession();
      }
    }, refreshTime);
  }, []);

  // Função para refresh manual da sessão
  const refreshSession = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (isRefreshingRef.current) {
      return { success: false, message: 'Refresh já em andamento' };
    }

    try {
      isRefreshingRef.current = true;
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        setIsSessionValid(false);
        return { success: false, message: 'Erro ao renovar sessão' };
      }

      if (data.session) {
        const isValid = checkSessionValidity(data.session);
        setSession(data.session);
        setIsSessionValid(isValid);
        
        if (isValid) {
          scheduleTokenRefresh(data.session);
        }
        
        return { success: true };
      }
      
      return { success: false, message: 'Sessão não encontrada' };
    } catch (error) {
      console.error('Erro inesperado ao renovar sessão:', error);
      setIsSessionValid(false);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      isRefreshingRef.current = false;
    }
  }, [checkSessionValidity, scheduleTokenRefresh]);

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const getInitialSession = async () => {
      const { session } = await auth.getCurrentSession();
      
      if (session) {
        const isValid = checkSessionValidity(session);
        setSession(session);
        setIsSessionValid(isValid);
        
        if (isValid && session.user) {
          await loadUserProfile(session.user.id);
          scheduleTokenRefresh(session);
        } else if (session.user) {
          // Tentar refresh se a sessão está próxima do vencimento
          await refreshSession();
        }
      }
      
      setIsLoading(false);
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthContext] Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' && session) {
        const isValid = checkSessionValidity(session);
        setSession(session);
        setIsSessionValid(isValid);
        
        if (isValid && session.user) {
          console.log('✅ [AuthContext] Usuário autenticado, carregando perfil...');
          await loadUserProfile(session.user.id);
          scheduleTokenRefresh(session);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ [AuthContext] Sessão perdida, limpando usuário...');
        setSession(null);
        setUser(null);
        setIsSessionValid(false);
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const isValid = checkSessionValidity(session);
        setSession(session);
        setIsSessionValid(isValid);
        
        if (isValid) {
          scheduleTokenRefresh(session);
        }
      } else {
        setSession(session);
        
        if (session?.user) {
          console.log('✅ [AuthContext] Usuário autenticado, carregando perfil...');
          await loadUserProfile(session.user.id);
        } else {
          console.log('❌ [AuthContext] Sessão perdida, limpando usuário...');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [checkSessionValidity, scheduleTokenRefresh, refreshSession]);

  const loadUserProfile = async (userId: string) => {
    console.log('👤 [AuthContext] Carregando perfil do usuário ID:', userId);
    
    try {
      console.log('👤 [AuthContext] Consultando tabela users...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('👤 [AuthContext] Resposta da consulta:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ [AuthContext] Erro ao carregar perfil do usuário:', error);
        console.error('❌ [AuthContext] Detalhes do erro:', { code: error.code, details: error.details, hint: error.hint });
        return;
      }

      if (data) {
        console.log('✅ [AuthContext] Perfil carregado:', { id: (data as any).id, email: (data as any).email, name: (data as any).name });
        setUser(data as User);
      } else {
        console.warn('⚠️ [AuthContext] Nenhum perfil encontrado para o usuário');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Erro inesperado ao carregar perfil:', error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 [AuthContext] Iniciando processo de login para:', email);
    
    try {
      console.log('🔐 [AuthContext] Chamando auth.signIn...');
      const { data, error } = await auth.signIn(email, password);

      console.log('🔐 [AuthContext] Resposta do auth.signIn:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ [AuthContext] Erro no login:', error);
        return { success: false, message: error.message || 'Erro ao fazer login' };
      }

      if (data.session) {
        console.log('✅ [AuthContext] Sessão criada, ID do usuário:', data.session.user?.id);
        setSession(data.session);
        
        if (data.session.user) {
          console.log('🔐 [AuthContext] Carregando perfil do usuário...');
          await loadUserProfile(data.session.user.id);
        }
      } else {
        console.warn('⚠️ [AuthContext] Login bem-sucedido mas sem sessão');
      }

      console.log('✅ [AuthContext] Login concluído com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ [AuthContext] Erro inesperado no login:', error);
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
        const { error: profileError } = await (supabase as any)
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            is_active: true
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
    console.log('🚪 [AuthContext] Logout iniciado manualmente');
    console.trace('🚪 [AuthContext] Stack trace do logout:');
    
    try {
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('❌ [AuthContext] Erro no logout:', error);
        return { success: false, message: error.message || 'Erro ao fazer logout' };
      }

      console.log('✅ [AuthContext] Logout bem-sucedido');
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      console.error('❌ [AuthContext] Erro inesperado no logout:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    return requiredRoles.includes(user.role as any);
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
    refreshSession,
    isSessionValid,
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