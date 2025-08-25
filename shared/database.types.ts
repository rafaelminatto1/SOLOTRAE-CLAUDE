export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'physiotherapist' | 'patient';
          phone?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'physiotherapist' | 'patient';
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'physiotherapist' | 'patient';
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          birth_date?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          medical_history?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          birth_date?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          birth_date?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      physiotherapists: {
        Row: {
          id: string;
          user_id: string;
          license_number: string;
          specialization?: string;
          experience_years?: number;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          license_number: string;
          specialization?: string;
          experience_years?: number;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          license_number?: string;
          specialization?: string;
          experience_years?: number;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          physiotherapist_id: string;
          date: string;
          time: string;
          duration: number;
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          physiotherapist_id: string;
          date: string;
          time: string;
          duration: number;
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          physiotherapist_id?: string;
          date?: string;
          time?: string;
          duration?: number;
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          description?: string;
          instructions?: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration?: number;
          repetitions?: number;
          sets?: number;
          image_url?: string;
          video_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          instructions?: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration?: number;
          repetitions?: number;
          sets?: number;
          image_url?: string;
          video_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          instructions?: string;
          category?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          duration?: number;
          repetitions?: number;
          sets?: number;
          image_url?: string;
          video_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      treatment_plans: {
        Row: {
          id: string;
          patient_id: string;
          physiotherapist_id: string;
          name: string;
          description?: string;
          start_date: string;
          end_date?: string;
          status: 'active' | 'completed' | 'paused';
          goals?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          physiotherapist_id: string;
          name: string;
          description?: string;
          start_date: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'paused';
          goals?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          physiotherapist_id?: string;
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'completed' | 'paused';
          goals?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      treatment_plan_exercises: {
        Row: {
          id: string;
          treatment_plan_id: string;
          exercise_id: string;
          order_index: number;
          sets?: number;
          repetitions?: number;
          duration?: number;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          treatment_plan_id: string;
          exercise_id: string;
          order_index: number;
          sets?: number;
          repetitions?: number;
          duration?: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          treatment_plan_id?: string;
          exercise_id?: string;
          order_index?: number;
          sets?: number;
          repetitions?: number;
          duration?: number;
          notes?: string;
          created_at?: string;
        };
      };
      exercise_logs: {
        Row: {
          id: string;
          patient_id: string;
          exercise_id: string;
          treatment_plan_id?: string;
          completed_at: string;
          sets_completed?: number;
          repetitions_completed?: number;
          duration_completed?: number;
          difficulty_rating?: number;
          pain_level?: number;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          exercise_id: string;
          treatment_plan_id?: string;
          completed_at: string;
          sets_completed?: number;
          repetitions_completed?: number;
          duration_completed?: number;
          difficulty_rating?: number;
          pain_level?: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          exercise_id?: string;
          treatment_plan_id?: string;
          completed_at?: string;
          sets_completed?: number;
          repetitions_completed?: number;
          duration_completed?: number;
          difficulty_rating?: number;
          pain_level?: number;
          notes?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: any;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: any;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: any;
          read?: boolean;
          created_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          original_name: string;
          filename: string;
          mimetype: string;
          size: number;
          category: string;
          path: string;
          url?: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_name: string;
          filename: string;
          mimetype: string;
          size: number;
          category: string;
          path: string;
          url?: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_name?: string;
          filename?: string;
          mimetype?: string;
          size?: number;
          category?: string;
          path?: string;
          url?: string;
          uploaded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
