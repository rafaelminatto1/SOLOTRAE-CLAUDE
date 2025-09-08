import { supabase } from './supabase';
import { toast } from 'sonner';

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  retryCount?: number;
}

interface AuthInterceptorConfig {
  maxRetries: number;
  retryDelay: number;
  enableAutoRefresh: boolean;
  enableErrorToasts: boolean;
}

class AuthInterceptor {
  private config: AuthInterceptorConfig;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(config: Partial<AuthInterceptorConfig> = {}) {
    this.config = {
      maxRetries: 1,
      retryDelay: 1000,
      enableAutoRefresh: true,
      enableErrorToasts: true,
      ...config
    };
  }

  // Intercepta requisições para adicionar token de autenticação
  async interceptRequest(config: RequestConfig): Promise<RequestConfig> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        };
      }

      return config;
    } catch (error) {
      console.error('Erro ao interceptar requisição:', error);
      return config;
    }
  }

  // Intercepta respostas para tratar erros de autenticação
  async interceptResponse(response: Response, originalConfig: RequestConfig): Promise<Response> {
    // Se a resposta é bem-sucedida, retorna normalmente
    if (response.ok) {
      return response;
    }

    // Trata erros de autenticação (401)
    if (response.status === 401) {
      return this.handleAuthError(response, originalConfig);
    }

    // Trata erros de permissão (403)
    if (response.status === 403) {
      if (this.config.enableErrorToasts) {
        toast.error('Você não tem permissão para realizar esta ação.');
      }
      return response;
    }

    // Trata erros de servidor (5xx)
    if (response.status >= 500) {
      if (this.config.enableErrorToasts) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      }
      return response;
    }

    return response;
  }

  // Trata especificamente erros de autenticação
  private async handleAuthError(response: Response, originalConfig: RequestConfig): Promise<Response> {
    const retryCount = originalConfig.retryCount || 0;

    // Se já tentou o máximo de vezes ou auto-refresh está desabilitado
    if (retryCount >= this.config.maxRetries || !this.config.enableAutoRefresh) {
      if (this.config.enableErrorToasts) {
        toast.error('Sessão expirada. Faça login novamente.');
      }
      
      // Redireciona para login
      window.location.href = '/login';
      return response;
    }

    try {
      // Tenta renovar o token
      const refreshSuccess = await this.refreshToken();
      
      if (refreshSuccess) {
        // Retry da requisição original com novo token
        const newConfig = {
          ...originalConfig,
          retryCount: retryCount + 1
        };
        
        // Aguarda um pouco antes de tentar novamente
        await this.delay(this.config.retryDelay);
        
        return this.makeRequest(newConfig);
      } else {
        if (this.config.enableErrorToasts) {
          toast.error('Não foi possível renovar a sessão. Faça login novamente.');
        }
        
        // Redireciona para login
        window.location.href = '/login';
        return response;
      }
    } catch (error) {
      console.error('Erro ao tentar renovar token:', error);
      
      if (this.config.enableErrorToasts) {
        toast.error('Erro ao renovar sessão. Faça login novamente.');
      }
      
      // Redireciona para login
      window.location.href = '/login';
      return response;
    }
  }

  // Renova o token de autenticação
  private async refreshToken(): Promise<boolean> {
    // Se já está renovando, aguarda a renovação em andamento
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Executa a renovação do token
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        return false;
      }

      if (data.session) {
        console.log('✅ Token renovado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro inesperado ao renovar token:', error);
      return false;
    }
  }

  // Faz uma requisição com interceptação
  async makeRequest(config: RequestConfig): Promise<Response> {
    try {
      // Intercepta a requisição para adicionar headers
      const interceptedConfig = await this.interceptRequest(config);
      
      // Faz a requisição
      const response = await fetch(interceptedConfig.url, {
        method: interceptedConfig.method,
        headers: interceptedConfig.headers,
        body: interceptedConfig.body ? JSON.stringify(interceptedConfig.body) : undefined
      });

      // Intercepta a resposta para tratar erros
      return this.interceptResponse(response, config);
    } catch (error) {
      console.error('Erro na requisição:', error);
      
      if (this.config.enableErrorToasts) {
        toast.error('Erro de conexão. Verifique sua internet.');
      }
      
      throw error;
    }
  }

  // Função auxiliar para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método para fazer requisições GET
  async get(url: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest({
      url,
      method: 'GET',
      headers
    });
  }

  // Método para fazer requisições POST
  async post(url: string, body?: any, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest({
      url,
      method: 'POST',
      body,
      headers
    });
  }

  // Método para fazer requisições PUT
  async put(url: string, body?: any, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest({
      url,
      method: 'PUT',
      body,
      headers
    });
  }

  // Método para fazer requisições DELETE
  async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeRequest({
      url,
      method: 'DELETE',
      headers
    });
  }
}

// Instância global do interceptor
export const authInterceptor = new AuthInterceptor({
  maxRetries: 1,
  retryDelay: 1000,
  enableAutoRefresh: true,
  enableErrorToasts: true
});

// Função helper para requisições autenticadas
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return authInterceptor.makeRequest({
    url,
    method: options.method || 'GET',
    headers: options.headers as Record<string, string>,
    body: options.body
  });
}

// Função para configurar o interceptor
export function configureAuthInterceptor(config: Partial<AuthInterceptorConfig>) {
  Object.assign(authInterceptor['config'], config);
}

export default authInterceptor;