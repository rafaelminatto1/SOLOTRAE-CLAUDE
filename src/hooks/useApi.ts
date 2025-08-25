import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<ApiResponse<T>>;
  mutate: (...args: any[]) => Promise<ApiResponse<T>>;
  refetch: (...args: any[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useApi<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requireAuth?: boolean;
  } = {}
): UseApiReturn<T> {
  const { method = 'GET', requireAuth = true } = options;
  const { session, logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (body?: any, queryParams?: Record<string, string>): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        // Construir URL com query parameters
        let url = `${API_BASE_URL}${endpoint}`;
        if (queryParams) {
          const searchParams = new URLSearchParams(queryParams);
          url += `?${searchParams.toString()}`;
        }

        // Configurar headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (requireAuth && session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        // Configurar opções da requisição
        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = JSON.stringify(body);
        }

        // Fazer requisição
        let response = await fetch(url, fetchOptions);

        // Se token expirou, fazer logout
        if (response.status === 401 && requireAuth) {
          logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }

        const responseData = await response.json();

        if (response.ok) {
          setData(responseData.data || responseData);
          return {
            success: true,
            data: responseData.data || responseData,
            message: responseData.message,
          };
        } else {
          const errorMessage = responseData.message || 'Erro na requisição';
          setError(errorMessage);
          return {
            success: false,
            message: errorMessage,
            errors: responseData.errors,
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, requireAuth, session?.access_token, logout]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    mutate: execute,
    refetch: execute,
    reset,
  };
}

// Hook específico para GET requests
export function useApiGet<T = any>(endpoint: string, requireAuth = true, autoFetch = true) {
  const api = useApi<T>(endpoint, { method: 'GET', requireAuth });
  
  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      api.execute();
    }
  }, [autoFetch, api.execute]);
  
  return api;
}

// Hook específico para POST requests
export function useApiPost<T = any>(endpoint: string, requireAuth = true) {
  return useApi<T>(endpoint, { method: 'POST', requireAuth });
}

// Hook específico para PUT requests
export function useApiPut<T = any>(endpoint: string, requireAuth = true) {
  return useApi<T>(endpoint, { method: 'PUT', requireAuth });
}

// Hook específico para DELETE requests
export function useApiDelete<T = any>(endpoint: string, requireAuth = true) {
  return useApi<T>(endpoint, { method: 'DELETE', requireAuth });
}

// Hook para upload de arquivos usando Supabase Storage
export function useFileUpload() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, bucket: string, path?: string): Promise<ApiResponse> => {
      setLoading(true);
      setError(null);

      try {
        if (!session) {
          throw new Error('Usuário não autenticado');
        }

        const fileName = path || `${Date.now()}-${file.name}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return {
          success: true,
          data: {
            path: data.path,
            publicUrl,
            fileName
          },
          message: 'Upload realizado com sucesso',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  return {
    upload,
    loading,
    error,
  };
}