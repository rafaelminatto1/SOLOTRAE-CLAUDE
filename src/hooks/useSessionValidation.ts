import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SessionValidationOptions {
  redirectOnExpired?: boolean;
  showToastOnExpired?: boolean;
  autoRefresh?: boolean;
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
}

export function useSessionValidation(options: SessionValidationOptions = {}) {
  const {
    redirectOnExpired = true,
    showToastOnExpired = true,
    autoRefresh = true,
    onSessionExpired,
    onSessionRefreshed
  } = options;

  const { session, isSessionValid, refreshSession, logout } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<number>(0);

  // Função para validar sessão manualmente
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (isValidating) return isSessionValid;
    
    setIsValidating(true);
    
    try {
      if (!session) {
        if (showToastOnExpired) {
          toast.error('Sessão não encontrada. Faça login novamente.');
        }
        if (redirectOnExpired) {
          navigate('/login');
        }
        onSessionExpired?.();
        return false;
      }

      if (!isSessionValid) {
        if (autoRefresh) {
          const refreshResult = await refreshSession();
          
          if (refreshResult.success) {
            if (showToastOnExpired) {
              toast.success('Sessão renovada automaticamente.');
            }
            onSessionRefreshed?.();
            setLastValidationTime(Date.now());
            return true;
          } else {
            if (showToastOnExpired) {
              toast.error('Sessão expirada. Faça login novamente.');
            }
            if (redirectOnExpired) {
              await logout();
              navigate('/login');
            }
            onSessionExpired?.();
            return false;
          }
        } else {
          if (showToastOnExpired) {
            toast.error('Sessão expirada. Faça login novamente.');
          }
          if (redirectOnExpired) {
            await logout();
            navigate('/login');
          }
          onSessionExpired?.();
          return false;
        }
      }

      setLastValidationTime(Date.now());
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      if (showToastOnExpired) {
        toast.error('Erro ao validar sessão. Tente novamente.');
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [session, isSessionValid, refreshSession, logout, navigate, autoRefresh, showToastOnExpired, redirectOnExpired, onSessionExpired, onSessionRefreshed, isValidating]);

  // Função para forçar refresh da sessão
  const forceRefreshSession = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = await refreshSession();
      
      if (result.success) {
        toast.success('Sessão renovada com sucesso.');
        onSessionRefreshed?.();
        setLastValidationTime(Date.now());
        return true;
      } else {
        toast.error(result.message || 'Erro ao renovar sessão.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao forçar refresh da sessão:', error);
      toast.error('Erro inesperado ao renovar sessão.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [refreshSession, onSessionRefreshed]);

  // Validação automática periódica (a cada 5 minutos)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Só valida se passou mais de 4 minutos desde a última validação
      if (now - lastValidationTime > 240000) {
        validateSession();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [session, validateSession, lastValidationTime]);

  // Validação inicial quando o hook é montado
  useEffect(() => {
    if (session && !lastValidationTime) {
      validateSession();
    }
  }, [session, validateSession, lastValidationTime]);

  return {
    isSessionValid,
    isValidating,
    validateSession,
    forceRefreshSession,
    lastValidationTime
  };
}

// Hook simplificado para componentes que só precisam garantir autenticação
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { validateSession } = useSessionValidation({
    redirectOnExpired: true,
    showToastOnExpired: true,
    autoRefresh: true
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    } else if (isAuthenticated) {
      validateSession();
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, validateSession]);

  return {
    isAuthenticated,
    isLoading
  };
}

// Hook para interceptar erros de API relacionados à autenticação
export function useAuthErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = useCallback(async (error: any) => {
    // Verifica se é um erro de autenticação
    if (error?.status === 401 || error?.message?.includes('JWT') || error?.message?.includes('token')) {
      toast.error('Sessão expirada. Redirecionando para login...');
      await logout();
      navigate('/login');
      return true;
    }
    
    // Verifica se é um erro de permissão
    if (error?.status === 403) {
      toast.error('Você não tem permissão para realizar esta ação.');
      return true;
    }

    return false;
  }, [logout, navigate]);

  return { handleAuthError };
}