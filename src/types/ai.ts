// Tipos específicos para componentes de IA do FisioFlow

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    category?: 'diagnosis' | 'exercise' | 'treatment' | 'general';
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface AIInsight {
  type: 'positive' | 'concern' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'progress' | 'adherence' | 'outcome' | 'risk' | 'opportunity';
}

export interface ExerciseRecommendation {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  targetMuscles: string[];
  equipment: string[];
  aiConfidence: number; // 0-100
  personalizedReason: string;
  contraindications?: string[];
  modifications?: {
    easier: string;
    harder: string;
  };
  videoUrl?: string;
  evidenceLevel: 'A' | 'B' | 'C'; // Nível de evidência científica
  expectedResults: {
    timeline: string;
    outcomes: string[];
  };
}

export interface DiagnosticHypothesis {
  condition: string;
  probability: number;
  confidence: number;
  evidence: string[];
  contraEvidence: string[];
  suggestedTests: string[];
  redFlags: string[];
  treatmentApproach: string;
  prognosis: {
    timeframe: string;
    outlook: 'excellent' | 'good' | 'fair' | 'guarded';
    factors: string[];
  };
}

export interface ClinicalDecisionSupport {
  recommendedAction: 'continue_assessment' | 'refer_specialist' | 'order_imaging' | 'start_treatment' | 'urgent_referral';
  reasoning: string;
  nextSteps: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProgressMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  interpretation: string;
}

export interface PatientAnalysisData {
  id: string;
  name: string;
  condition: string;
  startDate: string;
  sessions: number;
  adherenceRate: number;
  painLevel: number; // 0-10
  functionalScore: number; // 0-100
  satisfactionScore: number; // 0-100
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'learning' | 'maintenance';
  accuracy: number;
  lastUpdate: string;
  category: 'diagnosis' | 'treatment' | 'analytics' | 'general';
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  metadata?: {
    confidence: number;
    category: string;
    priority: string;
  };
}

export interface PatientProfile {
  age: number;
  condition: string;
  limitations: string[];
  goals: string[];
  fitnessLevel: 'low' | 'medium' | 'high';
  previousExercises?: string[];
}

export interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  location?: string;
  triggers?: string[];
  alleviators?: string[];
}

// Enums para facilitar o uso
export enum AIMessageType {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export enum AIInsightType {
  POSITIVE = 'positive',
  CONCERN = 'concern',
  RECOMMENDATION = 'recommendation',
  MILESTONE = 'milestone'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum EvidenceLevel {
  A = 'A', // Alta qualidade
  B = 'B', // Qualidade moderada
  C = 'C'  // Baixa qualidade
}

export enum PrognosisOutlook {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  GUARDED = 'guarded'
}

export enum AIContext {
  DASHBOARD = 'dashboard',
  PATIENT = 'patient',
  EXERCISE = 'exercise',
  APPOINTMENT = 'appointment'
}

// Tipos para API
export interface AIAnalysisRequest {
  patientId?: string;
  symptoms?: Symptom[];
  chiefComplaint?: string;
  patientHistory?: string;
  physicalExam?: string;
  context: AIContext;
}

export interface AIAnalysisResponse {
  hypotheses: DiagnosticHypothesis[];
  clinicalSupport: ClinicalDecisionSupport;
  confidence: number;
  processingTime: number;
}

export interface ExerciseRecommendationRequest {
  patientId: string;
  patientProfile?: PatientProfile;
  context: 'prescription' | 'modification' | 'progression' | 'recovery';
  filters?: {
    difficulty?: DifficultyLevel[];
    muscleGroups?: string[];
    equipment?: string[];
  };
}

export interface ProgressAnalysisRequest {
  patientId: string;
  timeframe: '1w' | '1m' | '3m' | '6m' | '1y';
  includeInsights?: boolean;
  includePredictions?: boolean;
}

// Configurações da IA
export interface AIConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  enableVoice: boolean;
  autoSuggestions: boolean;
  confidenceThreshold: number;
  updateFrequency: 'real-time' | 'daily' | 'weekly';
}

// Status do sistema IA
export interface AISystemStatus {
  isOnline: boolean;
  lastUpdate: string;
  model: string;
  knowledgeBase: {
    casesCount: number;
    lastSync: string;
  };
  performance: {
    averageResponseTime: number;
    accuracy: number;
    uptime: number;
  };
}