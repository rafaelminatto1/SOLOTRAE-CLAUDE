// =================================
// FISIOFLOW - TIPOS COMPARTILHADOS
// =================================

// Enums - Sincronizados com o banco de dados
export enum UserRole {
  ADMIN = 'admin',
  PHYSIOTHERAPIST = 'physiotherapist',
  PATIENT = 'patient',
  SECRETARY = 'secretary',
  PARTNER = 'partner',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  RETURN = 'return',
  EVALUATION = 'evaluation',
  TREATMENT = 'treatment',
  THERAPY = 'therapy',
  SESSION = 'session',
  TELECONSULTATION = 'teleconsultation',
}

export enum ExerciseCategory {
  CERVICAL = 'cervical',
  UPPER_LIMBS = 'upper_limbs',
  TRUNK = 'trunk',
  LOWER_LIMBS = 'lower_limbs',
  NEURAL_MOBILIZATION = 'neural_mobilization',
  GENERAL_MOBILITY = 'general_mobility',
  STRENGTHENING = 'strengthening',
  STRETCHING = 'stretching',
  BALANCE = 'balance',
  CARDIO = 'cardio',
}

export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCHARGED = 'discharged',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  M = 'M',
  F = 'F',
  OTHER = 'other',
  Other = 'Other',
}

export enum MaritalStatus {
  SINGLE = 'single',
  single = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum VoucherType {
  AVULSO = 'AVULSO',
  MENSAL = 'MENSAL',
  PACOTE = 'PACOTE',
}

export enum VoucherStatus {
  ATIVO = 'ATIVO',
  USADO = 'USADO',
  EXPIRADO = 'EXPIRADO',
  CANCELADO = 'CANCELADO',
}

export enum PaymentStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

// Interfaces de Usuário - Sincronizadas com o banco
export interface User {
  id: number;
  email: string;
  name: string;
  full_name?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Physiotherapist {
  id: number;
  user_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  crefito: string;
  specialties?: string;
  specialization?: string;
  bio?: string;
  experience_years?: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Interfaces de Requisições - Atualizadas
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface CreatePhysiotherapistRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  crefito: string;
  specialties?: string;
  bio?: string;
  experience_years?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  permissions: string[];
}

// Interfaces de Paciente - Sincronizadas com o banco
export interface Patient {
  id: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profession?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_phone?: string;
  emergency_contact_phone?: string;
  insurance_name?: string;
  insurance_number?: string;
  medical_history?: string;
  medical_notes?: string;
  allergies?: string;
  medications?: string;
  current_medications?: string;
  family_history?: string;
  status?: PatientStatus;
  marital_status?: MaritalStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface HealthInsurance {
  nome: string;
  numero: string;
  validade: string;
  ativo: boolean;
}

export interface CreatePatientRequest {
  user_id?: number;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
}

// Interfaces de Prontuário
export interface MedicalRecord {
  id: string;
  pacienteId: string;
  avaliacaoInicial?: string;
  classificacaoCoffito?: CoffitoClassification;
  testesEspeciais?: SpecialTest[];
  fotosEvolucao?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CoffitoClassification {
  cid: string;
  descricao: string;
  categoria: string;
}

export interface SpecialTest {
  nome: string;
  resultado: string;
  data: string;
  observacoes?: string;
}

export interface Evolution {
  id: string;
  prontuarioId: string;
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
  escalaDor: number; // 0-10
  fisioterapeutaId: string;
  createdAt: string;
}

export interface CreateEvolutionRequest {
  prontuarioId: string;
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
  escalaDor: number;
}

// Interfaces de Agendamento - Sincronizadas com o banco
export interface Appointment {
  id: number;
  patient_id: number;
  physiotherapist_id: number;
  date: string;
  time: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  duration: number;
  status: AppointmentStatus;
  type: string;
  appointment_type?: string;
  notes?: string;
  price?: number;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  patient?: Patient;
  physiotherapist?: Physiotherapist;
}

export interface CreateAppointmentRequest {
  patient_id: number;
  physiotherapist_id: number;
  date: string;
  time: string;
  duration?: number;
  type: string;
  notes?: string;
}

export interface CreateExerciseRequest {
  name: string;
  description?: string;
  category: string;
  difficulty?: ExerciseDifficulty;
  duration?: number;
  repetitions?: number;
  sets?: number;
  instructions?: string;
  precautions?: string;
  image_url?: string;
  video_url?: string;
}

export interface CreateTreatmentPlanRequest {
  patient_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  goals?: string;
  notes?: string;
  exercises?: {
    exercise_id: number;
    sets?: number;
    repetitions?: number;
    duration?: number;
    frequency?: string;
    notes?: string;
    order_index?: number;
  }[];
}

export interface AppointmentSlot {
  start: string;
  end: string;
  available: boolean;
  fisioterapeutaId: string;
}

// Interfaces de Exercícios - Sincronizadas com o banco
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  category: string;
  difficulty?: ExerciseDifficulty;
  duration?: number;
  repetitions?: number;
  sets?: number;
  instructions?: string;
  precautions?: string;
  image_url?: string;
  video_url?: string;
  created_by?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: User;
  // Propriedades adicionais para o frontend
  feedback?: string;
  status?: 'pendente' | 'em_andamento' | 'concluido';
  progress?: number; // Progresso do exercício (0-100)
  difficulty_level?: string; // Nível de dificuldade
  estimated_duration?: number; // Duração estimada em minutos
}

// Interfaces de Planos de Tratamento - Sincronizadas com o banco
export interface TreatmentPlan {
  id: number;
  patient_id: number;
  physiotherapist_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  goals?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  physiotherapist?: Physiotherapist;
  exercises?: TreatmentPlanExercise[];
}

export interface TreatmentPlanExercise {
  id: number;
  treatment_plan_id: number;
  exercise_id: number;
  sets?: number;
  repetitions?: number;
  duration?: number;
  frequency?: string;
  notes?: string;
  order_index?: number;
  created_at: string;
  exercise?: Exercise;
}

// Interfaces de Logs de Exercícios - Sincronizadas com o banco
export interface ExerciseLog {
  id: number;
  patient_id: number;
  exercise_id: number;
  treatment_plan_id?: number;
  completed_sets?: number;
  completed_repetitions?: number;
  completed_duration?: number;
  difficulty_rating?: number; // 1-10
  pain_level?: number; // 0-10
  notes?: string;
  completed_at: string;
  patient?: Patient;
  exercise?: Exercise;
  treatment_plan?: TreatmentPlan;
}

// Interfaces de Notificações - Sincronizadas com o banco
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
  user?: User;
}

// Interfaces de Arquivos - Sincronizadas com o banco
export interface FileRecord {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  uploaded_by: number;
  entity_type?: string;
  entity_id?: number;
  created_at: string;
  uploader?: User;
}

// Interface para documentos
export interface Document {
  id: number;
  patient_id: number;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  uploader?: User;
  // Propriedades adicionais para compatibilidade
  name: string; // Alias para title
  type: string; // Alias para file_type
  upload_date: string; // Alias para created_at
  size: number; // Alias para file_size
}

// Interface para mensagens
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'file' | 'image';
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

// Interfaces de IA
export interface AIConsultation {
  id: string;
  userId: string;
  pergunta: string;
  resposta: string;
  fonte: 'interna' | 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  confianca: number; // 0-1
  contexto?: any;
  createdAt: string;
}

export interface AIConsultationRequest {
  pergunta: string;
  contexto?: {
    pacienteId?: string;
    tipo?: 'diagnostico' | 'exercicios' | 'evolucao' | 'relatorio';
  };
}

export interface AIConsultationResponse {
  resposta: string;
  fonte: string;
  confianca: number;
  referencias?: string[];
}

// Interfaces de Sistema de Parcerias
export interface Partner {
  id: string;
  nome: string;
  email: string;
  especialidade: string;
  comissao: number; // Percentual
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  codigo: string;
  tipo: VoucherType;
  valor: number;
  status: VoucherStatus;
  pacienteId: string;
  parceiroId: string;
  dataExpiracao?: string;
  dataUso?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherRequest {
  tipo: VoucherType;
  valor: number;
  pacienteId: string;
  parceiroId: string;
  dataExpiracao?: string;
  observacoes?: string;
}

// Interfaces Financeiras
export interface Transaction {
  id: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  valor: number;
  descricao: string;
  data: string;
  status: PaymentStatus;
  pacienteId?: string;
  voucherId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialReport {
  periodo: {
    inicio: string;
    fim: string;
  };
  receitas: {
    consultas: number;
    vouchers: number;
    convenios: number;
    total: number;
  };
  despesas: {
    total: number;
    categorias: { [key: string]: number };
  };
  lucroLiquido: number;
  kpis: {
    faturamentoMensal: number;
    pacientesAtivos: number;
    taxaOcupacao: number;
    nps: number;
    produtividadePorProfissional: { [key: string]: number };
    taxaNoShow: number;
  };
}

// Interfaces de Mentoria
export interface MentorshipProgress {
  id: string;
  estagiarioId: string;
  supervisorId: string;
  horasPraticas: number;
  competencias: Competency[];
  avaliacoes: MentorshipEvaluation[];
  certificados: Certificate[];
  createdAt: string;
  updatedAt: string;
}

export interface Competency {
  id: string;
  nome: string;
  descricao: string;
  nivel: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'EXPERT';
  concluida: boolean;
  dataConlusao?: string;
}

export interface MentorshipEvaluation {
  id: string;
  supervisorId: string;
  estagiarioId: string;
  nota: number; // 0-10
  feedback: string;
  competenciasAvaliadas: string[];
  data: string;
}

export interface Certificate {
  id: string;
  nome: string;
  descricao: string;
  dataEmissao: string;
  validoAte?: string;
  url: string;
}

// Interfaces de Sistema - Simplificadas
export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// Interfaces de API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos utilitários
export type CreateRequest<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRequest<T> = Partial<CreateRequest<T>>;
export type ID = string;
export type Timestamp = string;

// Constantes
export const PAIN_SCALE_MAX = 10;
export const DEFAULT_APPOINTMENT_DURATION = 60; // minutos
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'video/mp4',
];

// Constantes atualizadas
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  PHYSIOTHERAPIST: 'physiotherapist' as const,
  PATIENT: 'patient' as const,
  SECRETARY: 'secretary' as const,
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled' as const,
  CONFIRMED: 'confirmed' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  NO_SHOW: 'no_show' as const,
};

export const EXERCISE_CATEGORIES = {
  STRENGTHENING: 'strengthening' as const,
  STRETCHING: 'stretching' as const,
  MOBILITY: 'mobility' as const,
  BALANCE: 'balance' as const,
  COORDINATION: 'coordination' as const,
  RESPIRATORY: 'respiratory' as const,
  CARDIOVASCULAR: 'cardiovascular' as const,
  NEUROLOGICAL: 'neurological' as const,
  POSTURAL: 'postural' as const,
};

// Validações
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  crefito: /^\d{1,2}\/\d{4,6}-F$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

// Regras de validação atualizadas
export const VALIDATION_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  CPF_LENGTH: 11,
  CREFITO_MIN_LENGTH: 6,
  PHONE_MIN_LENGTH: 10,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  NOTES_MAX_LENGTH: 2000,
  EXERCISE_NAME_MAX_LENGTH: 200,
  TREATMENT_PLAN_TITLE_MAX_LENGTH: 200,
  APPOINTMENT_DURATION_MIN: 15,
  APPOINTMENT_DURATION_MAX: 240,
};