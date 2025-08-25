// =================================
// FISIOFLOW - CONSTANTES COMPARTILHADAS
// =================================

// URLs e Endpoints
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ENABLE_2FA: '/auth/2fa/enable',
    VERIFY_2FA: '/auth/2fa/verify',
  },
  
  // Usuários
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PASSWORD: '/users/password',
    PERMISSIONS: '/users/permissions',
  },
  
  // Pacientes
  PATIENTS: {
    BASE: '/patients',
    SEARCH: '/patients/search',
    MEDICAL_RECORDS: '/patients/:id/medical-records',
    EVOLUTIONS: '/patients/:id/evolutions',
    APPOINTMENTS: '/patients/:id/appointments',
    PRESCRIPTIONS: '/patients/:id/prescriptions',
  },
  
  // Agendamentos
  APPOINTMENTS: {
    BASE: '/appointments',
    AVAILABLE_SLOTS: '/appointments/available-slots',
    CONFIRM: '/appointments/:id/confirm',
    CANCEL: '/appointments/:id/cancel',
    RESCHEDULE: '/appointments/:id/reschedule',
  },
  
  // Exercícios
  EXERCISES: {
    BASE: '/exercises',
    CATEGORIES: '/exercises/categories',
    SEARCH: '/exercises/search',
    UPLOAD_VIDEO: '/exercises/:id/video',
  },
  
  // Prescrições
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    SEND_WHATSAPP: '/prescriptions/:id/send-whatsapp',
    GENERATE_PDF: '/prescriptions/:id/pdf',
  },
  
  // IA
  AI: {
    CONSULTATION: '/ai/consultation',
    HISTORY: '/ai/history',
    FEEDBACK: '/ai/feedback',
  },
  
  // Parcerias
  PARTNERSHIPS: {
    PARTNERS: '/partnerships/partners',
    VOUCHERS: '/partnerships/vouchers',
    TRANSACTIONS: '/partnerships/transactions',
    REPORTS: '/partnerships/reports',
  },
  
  // Financeiro
  FINANCIAL: {
    TRANSACTIONS: '/financial/transactions',
    REPORTS: '/financial/reports',
    DASHBOARD: '/financial/dashboard',
    RECEIPTS: '/financial/receipts',
  },
  
  // Mentoria
  MENTORSHIP: {
    PROGRESS: '/mentorship/progress',
    EVALUATIONS: '/mentorship/evaluations',
    CERTIFICATES: '/mentorship/certificates',
    COMPETENCIES: '/mentorship/competencies',
  },
  
  // Integrações
  INTEGRATIONS: {
    WHATSAPP: '/integrations/whatsapp',
    CEP: '/integrations/cep',
    CPF: '/integrations/cpf',
    CREFITO: '/integrations/crefito',
    CALENDAR: '/integrations/calendar',
    TELEHEALTH: '/integrations/telehealth',
  },
  
  // Sistema
  SYSTEM: {
    CONFIG: '/system/config',
    NOTIFICATIONS: '/system/notifications',
    AUDIT: '/system/audit',
    BACKUP: '/system/backup',
    HEALTH: '/system/health',
  },
};

// Configurações de Paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LIMITS: [10, 20, 50, 100],
};

// Configurações de Cache
export const CACHE = {
  TTL: {
    SHORT: 5 * 60, // 5 minutos
    MEDIUM: 30 * 60, // 30 minutos
    LONG: 24 * 60 * 60, // 24 horas
  },
  KEYS: {
    USER_PROFILE: 'user:profile',
    EXERCISES: 'exercises:list',
    SYSTEM_CONFIG: 'system:config',
    AVAILABLE_SLOTS: 'appointments:slots',
  },
};

// Configurações de Arquivo
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  UPLOAD_PATHS: {
    PROFILE_PICTURES: '/uploads/profiles',
    EXERCISE_VIDEOS: '/uploads/exercises',
    MEDICAL_DOCUMENTS: '/uploads/medical',
    EVOLUTION_PHOTOS: '/uploads/evolutions',
  },
};

// Configurações de Segurança
export const SECURITY = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SPECIAL_CHARS: '!@#$%^&*(),.?":{}|<>',
  },
  
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ALGORITHM: 'HS256',
  },
  
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: {
      MAX: 5,
      WINDOW: 15 * 60 * 1000, // 15 minutos
      BLOCK_DURATION: 30 * 60 * 1000, // 30 minutos
    },
    API_CALLS: {
      MAX: 100,
      WINDOW: 60 * 1000, // 1 minuto
    },
  },
  
  SESSION: {
    TIMEOUT: 30 * 60 * 1000, // 30 minutos
    EXTEND_ON_ACTIVITY: true,
  },
};

// Configurações de Notificação
export const NOTIFICATIONS = {
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
  },
  
  CHANNELS: {
    EMAIL: 'email',
    WHATSAPP: 'whatsapp',
    PUSH: 'push',
    IN_APP: 'in_app',
  },
  
  TEMPLATES: {
    APPOINTMENT_REMINDER: 'appointment_reminder',
    APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
    APPOINTMENT_CANCELLATION: 'appointment_cancellation',
    PRESCRIPTION_SENT: 'prescription_sent',
    PAYMENT_RECEIVED: 'payment_received',
    SYSTEM_MAINTENANCE: 'system_maintenance',
  },
};

// Configurações de Agendamento
export const APPOINTMENT_CONFIG = {
  DEFAULT_DURATION: 60, // minutos
  AVAILABLE_DURATIONS: [30, 45, 60, 90, 120], // minutos
  
  WORKING_HOURS: {
    START: '07:00',
    END: '19:00',
    LUNCH_START: '12:00',
    LUNCH_END: '13:00',
  },
  
  BOOKING: {
    MAX_ADVANCE_DAYS: 90,
    MIN_ADVANCE_HOURS: 2,
    CANCELLATION_DEADLINE_HOURS: 24,
  },
  
  REMINDERS: {
    FIRST_REMINDER: 24 * 60, // 24 horas antes (em minutos)
    SECOND_REMINDER: 2 * 60, // 2 horas antes (em minutos)
  },
};

// Configurações de IA
export const AI_CONFIG = {
  PROVIDERS: {
    CHATGPT: 'chatgpt',
    CLAUDE: 'claude',
    GEMINI: 'gemini',
    PERPLEXITY: 'perplexity',
    INTERNAL: 'internal',
  },
  
  CONFIDENCE_THRESHOLD: 0.7,
  
  CONTEXT_TYPES: {
    DIAGNOSIS: 'diagnostico',
    EXERCISES: 'exercicios',
    EVOLUTION: 'evolucao',
    REPORT: 'relatorio',
  },
  
  RATE_LIMITS: {
    CHATGPT: {
      REQUESTS_PER_MINUTE: 20,
      TOKENS_PER_MINUTE: 40000,
    },
    CLAUDE: {
      REQUESTS_PER_MINUTE: 50,
      TOKENS_PER_MINUTE: 40000,
    },
    GEMINI: {
      REQUESTS_PER_MINUTE: 60,
      TOKENS_PER_MINUTE: 32000,
    },
    PERPLEXITY: {
      REQUESTS_PER_MINUTE: 20,
      TOKENS_PER_MINUTE: 40000,
    },
  },
};

// Configurações Financeiras
export const FINANCIAL_CONFIG = {
  COMMISSION_RATES: {
    PLATFORM: 0.10, // 10%
    GATEWAY: 0.03, // 3%
    PARTNER_NET: 0.85, // 85% (aproximado após impostos)
  },
  
  VOUCHER_TYPES: {
    SINGLE: {
      name: 'Avulso',
      sessions: 1,
      validity_days: 30,
    },
    MONTHLY: {
      name: 'Mensal',
      sessions: 8,
      validity_days: 30,
    },
    PACKAGE: {
      name: 'Pacote',
      sessions: 12,
      validity_days: 90,
    },
  },
  
  PAYMENT_METHODS: {
    CASH: 'Dinheiro',
    CARD: 'Cartão',
    PIX: 'PIX',
    BANK_TRANSFER: 'Transferência',
    VOUCHER: 'Voucher',
    INSURANCE: 'Convênio',
  },
  
  EXPENSE_CATEGORIES: {
    RENT: 'Aluguel',
    UTILITIES: 'Utilidades',
    EQUIPMENT: 'Equipamentos',
    SUPPLIES: 'Materiais',
    MARKETING: 'Marketing',
    PROFESSIONAL_FEES: 'Taxas Profissionais',
    INSURANCE: 'Seguros',
    OTHER: 'Outros',
  },
};

// Configurações de Relatórios
export const REPORTS_CONFIG = {
  PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom',
  },
  
  FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
  },
  
  TYPES: {
    FINANCIAL: 'financial',
    PATIENT_EVOLUTION: 'patient_evolution',
    TEAM_PERFORMANCE: 'team_performance',
    PROTOCOL_ANALYSIS: 'protocol_analysis',
    LGPD_COMPLIANCE: 'lgpd_compliance',
  },
};

// Configurações de Mentoria
export const MENTORSHIP_CONFIG = {
  COMPETENCY_LEVELS: {
    BEGINNER: {
      name: 'Iniciante',
      value: 1,
      color: '#ef4444',
    },
    INTERMEDIATE: {
      name: 'Intermediário',
      value: 2,
      color: '#f59e0b',
    },
    ADVANCED: {
      name: 'Avançado',
      value: 3,
      color: '#3b82f6',
    },
    EXPERT: {
      name: 'Expert',
      value: 4,
      color: '#10b981',
    },
  },
  
  EVALUATION_SCALE: {
    MIN: 0,
    MAX: 10,
    PASS_GRADE: 7,
  },
  
  REQUIRED_HOURS: {
    TOTAL: 500,
    PRACTICAL: 400,
    THEORETICAL: 100,
  },
};

// Configurações de Tema
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    HEALTHCARE: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    STATUS: {
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444',
      INFO: '#3b82f6',
    },
  },
  
  FONTS: {
    PRIMARY: 'Inter, sans-serif',
    SECONDARY: 'Open Sans, sans-serif',
    MONO: 'JetBrains Mono, monospace',
  },
  
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
};

// Configurações de Validação
export const VALIDATION_CONFIG = {
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    CREFITO: /^\d{1,2}\/\d{4,6}-F$/,
    CEP: /^\d{5}-\d{3}$/,
  },
  
  LENGTHS: {
    NAME: { MIN: 2, MAX: 100 },
    DESCRIPTION: { MIN: 10, MAX: 1000 },
    OBSERVATION: { MIN: 5, MAX: 500 },
    PASSWORD: { MIN: 8, MAX: 128 },
  },
};

// Configurações de Integração
export const INTEGRATION_CONFIG = {
  WHATSAPP: {
    API_VERSION: 'v17.0',
    MESSAGE_TYPES: {
      TEXT: 'text',
      TEMPLATE: 'template',
      MEDIA: 'media',
    },
  },
  
  TELEHEALTH: {
    PROVIDERS: {
      ZOOM: 'zoom',
      GOOGLE_MEET: 'google_meet',
    },
    DEFAULT_DURATION: 60, // minutos
  },
  
  CALENDAR: {
    PROVIDERS: {
      GOOGLE: 'google',
      OUTLOOK: 'outlook',
    },
  },
};

// Configurações de Performance
export const PERFORMANCE_CONFIG = {
  BUNDLE_SIZE_LIMIT: 500 * 1024, // 500KB
  
  LAZY_LOADING: {
    INTERSECTION_THRESHOLD: 0.1,
    ROOT_MARGIN: '50px',
  },
  
  IMAGE_OPTIMIZATION: {
    QUALITY: 80,
    FORMATS: ['webp', 'jpeg'],
    SIZES: [320, 640, 1024, 1280],
  },
  
  DATABASE: {
    CONNECTION_POOL_SIZE: 20,
    QUERY_TIMEOUT: 30000, // 30 segundos
    SLOW_QUERY_THRESHOLD: 1000, // 1 segundo
  },
};

// Configurações de Backup
export const BACKUP_CONFIG = {
  SCHEDULE: {
    DAILY: '0 2 * * *', // 2:00 AM todos os dias
    WEEKLY: '0 3 * * 0', // 3:00 AM aos domingos
    MONTHLY: '0 4 1 * *', // 4:00 AM no primeiro dia do mês
  },
  
  RETENTION: {
    DAILY: 7, // dias
    WEEKLY: 4, // semanas
    MONTHLY: 12, // meses
  },
  
  COMPRESSION: true,
  ENCRYPTION: true,
};

// Configurações de Log
export const LOG_CONFIG = {
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },
  
  RETENTION_DAYS: 30,
  
  CATEGORIES: {
    AUTH: 'auth',
    API: 'api',
    DATABASE: 'database',
    INTEGRATION: 'integration',
    SECURITY: 'security',
    PERFORMANCE: 'performance',
  },
};

// Mensagens de Erro Padrão
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Email inválido',
    INVALID_CPF: 'CPF inválido',
    INVALID_PHONE: 'Telefone inválido',
    INVALID_CREFITO: 'CREFITO inválido',
    PASSWORD_TOO_WEAK: 'Senha muito fraca',
    PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  },
  
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    ACCOUNT_LOCKED: 'Conta bloqueada temporariamente',
    TOKEN_EXPIRED: 'Token expirado',
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso negado',
  },
  
  SYSTEM: {
    INTERNAL_ERROR: 'Erro interno do servidor',
    SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',
    NETWORK_ERROR: 'Erro de conexão',
    TIMEOUT: 'Tempo limite excedido',
  },
};

// Mensagens de Sucesso Padrão
export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Removido com sucesso',
  SAVED: 'Salvo com sucesso',
  SENT: 'Enviado com sucesso',
  CONFIRMED: 'Confirmado com sucesso',
  CANCELLED: 'Cancelado com sucesso',
};

// Configurações de Desenvolvimento
export const DEV_CONFIG = {
  MOCK_DATA: {
    ENABLED: process.env.NODE_ENV === 'development',
    DELAY: 1000, // ms
  },
  
  DEBUG: {
    ENABLED: process.env.NODE_ENV === 'development',
    VERBOSE_LOGGING: true,
    SHOW_QUERIES: true,
  },
  
  HOT_RELOAD: {
    ENABLED: true,
    PORT: 3001,
  },
};