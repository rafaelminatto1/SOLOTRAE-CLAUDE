// Configuração da API
export const API_CONFIG = {
  BASE_URL: '', // Removido - usando Supabase diretamente
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_2FA: '/auth/verify-2fa',
    SETUP_2FA: '/auth/setup-2fa',
    PROFILE: '/auth/profile',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    APPOINTMENTS: '/dashboard/appointments',
  },
  
  // Usuários
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
  },
  
  // Pacientes
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
    HISTORY: (id: string) => `/patients/${id}/history`,
    DOCUMENTS: (id: string) => `/patients/${id}/documents`,
    UPLOAD_DOCUMENT: (id: string) => `/patients/${id}/documents`,
    EXERCISES: (id: string) => `/patients/${id}/exercises`,
    PROGRESS: (id: string) => `/patients/${id}/progress`,
  },
  
  // Agendamentos
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
    CONFIRM: (id: string) => `/appointments/${id}/confirm`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
    AVAILABILITY: '/appointments/availability',
    CALENDAR: '/appointments/calendar',
  },
  
  // Exercícios
  EXERCISES: {
    LIST: '/exercises',
    CREATE: '/exercises',
    GET: (id: string) => `/exercises/${id}`,
    UPDATE: (id: string) => `/exercises/${id}`,
    DELETE: (id: string) => `/exercises/${id}`,
    CATEGORIES: '/exercises/categories',
    SEARCH: '/exercises/search',
    PRESCRIBE: '/exercises/prescribe',
  },
  
  // IA Assistente
  AI: {
    CHAT: '/ai/chat',
    ANALYZE_PATIENT: '/ai/analyze-patient',
    SUGGEST_EXERCISES: '/ai/suggest-exercises',
    GENERATE_REPORT: '/ai/generate-report',
    PROVIDERS_STATUS: '/ai/providers-status',
    KNOWLEDGE: '/ai/knowledge',
    SEARCH_KNOWLEDGE: '/ai/knowledge/search',
    USAGE_STATS: '/ai/usage-stats',
    FEEDBACK: '/ai/feedback',
  },
  
  // Relatórios
  REPORTS: {
    FINANCIAL: '/reports/financial',
    PATIENTS: '/reports/patients',
    APPOINTMENTS: '/reports/appointments',
    PERFORMANCE: '/reports/performance',
    PARTNERSHIPS: '/reports/partnerships',
    DASHBOARD: '/reports/dashboard',
    KPI: '/reports/kpi',
    CUSTOM: '/reports/custom',
    EXPORT: '/reports/export',
    LGPD: '/reports/lgpd',
  },
  
  // Parcerias
  PARTNERSHIPS: {
    LIST: '/partnerships',
    CREATE: '/partnerships',
    GET: (id: string) => `/partnerships/${id}`,
    UPDATE: (id: string) => `/partnerships/${id}`,
    DELETE: (id: string) => `/partnerships/${id}`,
    DASHBOARD: (id: string) => `/partnerships/${id}/dashboard`,
    VOUCHERS: (id: string) => `/partnerships/${id}/vouchers`,
    CREATE_VOUCHER: (id: string) => `/partnerships/${id}/vouchers`,
    VALIDATE_VOUCHER: '/partnerships/vouchers/validate',
    USE_VOUCHER: '/partnerships/vouchers/use',
  },
  
  // Notificações
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
    SEND: '/notifications/send',
  },
  
  // Integrações
  INTEGRATIONS: {
    WHATSAPP: '/integrations/whatsapp',
    EMAIL: '/integrations/email',
    SMS: '/integrations/sms',
    CALENDAR: '/integrations/calendar',
    PAYMENT: '/integrations/payment',
  },
  
  // Upload de arquivos
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
  },
};

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

// Tipos de erro da API
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Utilitários
export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'message' in error && 'status' in error;
};