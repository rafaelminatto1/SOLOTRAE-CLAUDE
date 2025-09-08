import { authInterceptor } from './authInterceptor';
import { toast } from 'sonner';

// Configuração do cliente API
export const API_CLIENT_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENABLE_AUTH_INTERCEPTOR: true,
  ENABLE_ERROR_LOGGING: true,
  ENABLE_REQUEST_LOGGING: false,
};

// Classe de erro personalizada para API
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Interface para resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Interface para configuração de requisição
export interface RequestConfig extends RequestInit {
  useAuth?: boolean;
  timeout?: number;
  retries?: number;
  skipErrorToast?: boolean;
}

// Cliente API principal
class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string = '', defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      useAuth: true,
      timeout: API_CLIENT_CONFIG.TIMEOUT,
      retries: API_CLIENT_CONFIG.RETRY_ATTEMPTS,
      skipErrorToast: false,
      ...defaultConfig
    };
  }

  // Método principal para fazer requisições
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const { useAuth, timeout, retries, skipErrorToast, ...fetchOptions } = finalConfig;
    
    const url = this.buildUrl(endpoint);
    
    if (API_CLIENT_CONFIG.ENABLE_REQUEST_LOGGING) {
      console.log(`🔄 API Request: ${fetchOptions.method || 'GET'} ${url}`);
    }

    try {
      let response: Response;
      
      if (useAuth && API_CLIENT_CONFIG.ENABLE_AUTH_INTERCEPTOR) {
        // Usa o interceptor de autenticação
        response = await authInterceptor.makeRequest({
          url,
          method: fetchOptions.method as string || 'GET',
          headers: fetchOptions.headers as Record<string, string>,
          body: fetchOptions.body
        });
      } else {
        // Requisição normal com timeout
        response = await this.fetchWithTimeout(url, fetchOptions, timeout!);
      }

      return await this.processResponse<T>(response, skipErrorToast!);
    } catch (error) {
      return this.handleError<T>(error, skipErrorToast!, retries!, endpoint, config);
    }
  }

  // Faz requisição com timeout
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Processa a resposta da API
  private async processResponse<T>(
    response: Response,
    skipErrorToast: boolean
  ): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
        
        if (!skipErrorToast) {
          this.showErrorToast(errorMessage, response.status);
        }
        
        throw new ApiError(
          errorMessage,
          response.status,
          data?.code,
          data
        );
      }

      if (API_CLIENT_CONFIG.ENABLE_REQUEST_LOGGING) {
        console.log(`✅ API Success: ${response.status}`);
      }

      return {
        success: true,
        data,
        message: data?.message,
        pagination: data?.pagination
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      const parseError = new ApiError(
        'Erro ao processar resposta da API',
        response.status,
        'PARSE_ERROR',
        error
      );
      
      if (!skipErrorToast) {
        this.showErrorToast(parseError.message, response.status);
      }
      
      throw parseError;
    }
  }

  // Trata erros de requisição
  private async handleError<T>(
    error: any,
    skipErrorToast: boolean,
    retries: number,
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    if (API_CLIENT_CONFIG.ENABLE_ERROR_LOGGING) {
      console.error('❌ API Error:', error);
    }

    // Se é um erro de rede e ainda tem tentativas
    if (retries > 0 && this.isRetryableError(error)) {
      await this.delay(API_CLIENT_CONFIG.RETRY_DELAY);
      return this.request<T>(endpoint, { ...config, retries: retries - 1 });
    }

    const apiError = error instanceof ApiError 
      ? error 
      : new ApiError(
          error?.message || 'Erro desconhecido na API',
          0,
          'NETWORK_ERROR',
          error
        );

    if (!skipErrorToast) {
      this.showErrorToast(apiError.message, apiError.status);
    }

    throw apiError;
  }

  // Verifica se o erro é passível de retry
  private isRetryableError(error: any): boolean {
    // Erros de rede ou timeout são passíveis de retry
    return (
      error?.name === 'AbortError' ||
      error?.name === 'TypeError' ||
      error?.code === 'NETWORK_ERROR' ||
      (error instanceof ApiError && error.status >= 500)
    );
  }

  // Mostra toast de erro baseado no status
  private showErrorToast(message: string, status: number) {
    if (status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
    } else if (status === 403) {
      toast.error('Você não tem permissão para realizar esta ação.');
    } else if (status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (status === 0) {
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      toast.error(message);
    }
  }

  // Constrói URL completa
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  // Função auxiliar para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos HTTP convenientes
  async get<T = any>(endpoint: string, params?: Record<string, any>, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const url = params ? this.buildUrl(endpoint, params) : endpoint;
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  }

  async put<T = any>(endpoint: string, body?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  }

  async patch<T = any>(endpoint: string, body?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  }

  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Método para upload de arquivos
  async upload<T = any>(endpoint: string, formData: FormData, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      // Não definir Content-Type para FormData (o browser define automaticamente)
      headers: {
        ...config.headers
      }
    });
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient();

// Exporta métodos convenientes
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
  request: apiClient.request.bind(apiClient)
};

// Função para configurar o cliente
export function configureApiClient(config: Partial<typeof API_CLIENT_CONFIG>) {
  Object.assign(API_CLIENT_CONFIG, config);
}

// Utilitários
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const handleApiError = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
};

export default apiClient;