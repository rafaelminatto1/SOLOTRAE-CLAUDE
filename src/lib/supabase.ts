import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/database.types';
import { Tables } from '../../shared/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qywbmnvsyjhlrmtsvkjd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5d2JtbnZzeWpobHJtdHN2a2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDUwODIsImV4cCI6MjA3MTQ4MTA4Mn0.NrCQt7GgpDaUmSlIgXq9RQOkAxYqDS6EtS0bv2-ErtE';

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

// Cliente Supabase para o frontend
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos exportados para uso no frontend
export type { Database, Tables, TablesInsert, TablesUpdate } from '../../shared/database.types';

// Tipos específicos para o frontend
export type User = Tables<'users'>;
export type Patient = Tables<'patients'>;
export type Physiotherapist = Tables<'physiotherapists'>;
export type Appointment = Tables<'appointments'>;
export type Exercise = Tables<'exercises'>;
export type TreatmentPlan = Tables<'treatment_plans'>;
export type TreatmentPlanExercise = Tables<'treatment_plan_exercises'>;
export type ExerciseLog = Tables<'exercise_logs'>;
export type Notification = Tables<'notifications'>;
export type FileRecord = Tables<'files'>;

// Funções utilitárias para autenticação
export const auth = {
  // Fazer login
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Fazer registro
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Fazer logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Obter sessão atual
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Resetar senha
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { data, error };
  },

  // Atualizar senha
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    return { data, error };
  }
};

// Funções utilitárias para Real-time
export const realtime = {
  // Escutar mudanças em uma tabela
  subscribe: (table: keyof Database['public']['Tables'], callback: (payload: any) => void) => {
    return supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table as string
      }, callback)
      .subscribe();
  },

  // Escutar mudanças específicas de um usuário
  subscribeToUser: (userId: string, table: keyof Database['public']['Tables'], callback: (payload: any) => void) => {
    return supabase
      .channel(`user:${userId}:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table as string,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Remover inscrição
  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription);
  }
};

// Funções utilitárias para Storage (se necessário no futuro)
export const storage = {
  // Upload de arquivo
  upload: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Download de arquivo
  download: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Obter URL pública
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Deletar arquivo
  remove: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  }
};