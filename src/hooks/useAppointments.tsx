import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  treatment_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    name: string;
    email: string;
    phone: string;
  };
  therapist?: {
    name: string;
    email: string;
  };
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<Appointment | null>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<Appointment | null>;
  cancelAppointment: (id: string, reason?: string) => Promise<boolean>;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByPatient: (patientId: string) => Promise<Appointment[]>;
  getAppointmentsByTherapist: (therapistId: string) => Promise<Appointment[]>;
  refreshAppointments: () => Promise<void>;
}

export const useAppointments = (filters?: {
  patientId?: string;
  therapistId?: string;
  dateRange?: { start: string; end: string };
}): UseAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, email, phone),
          therapist:therapists(name, email)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (filters?.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      
      if (filters?.therapistId) {
        query = query.eq('therapist_id', filters.therapistId);
      }
      
      if (filters?.dateRange) {
        query = query
          .gte('date', filters.dateRange.start)
          .lte('date', filters.dateRange.end);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setAppointments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar agendamentos';
      setError(errorMessage);
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> => {
    setError(null);
    
    try {
      const { data, error: createError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          patient:patients(name, email, phone),
          therapist:therapists(name, email)
        `)
        .single();
      
      if (createError) {
        throw createError;
      }
      
      if (data) {
        setAppointments(prev => [...prev, data].sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        }));
        return data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      console.error('Erro ao criar agendamento:', err);
      return null;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          patient:patients(name, email, phone),
          therapist:therapists(name, email)
        `)
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      if (data) {
        setAppointments(prev => prev.map(appointment => 
          appointment.id === id ? data : appointment
        ));
        return data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      console.error('Erro ao atualizar agendamento:', err);
      return null;
    }
  }, []);

  const cancelAppointment = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    setError(null);
    
    try {
      const updates: Partial<Appointment> = {
        status: 'canceled',
        notes: reason ? `Cancelado: ${reason}` : 'Cancelado'
      };
      
      const result = await updateAppointment(id, updates);
      return result !== null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      setError(errorMessage);
      console.error('Erro ao cancelar agendamento:', err);
      return false;
    }
  }, [updateAppointment]);

  const getAppointmentsByDate = useCallback((date: string): Appointment[] => {
    return appointments.filter(appointment => appointment.date === date);
  }, [appointments]);

  const getAppointmentsByPatient = useCallback(async (patientId: string): Promise<Appointment[]> => {
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, email, phone),
          therapist:therapists(name, email)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar agendamentos do paciente';
      setError(errorMessage);
      console.error('Erro ao buscar agendamentos por paciente:', err);
      return [];
    }
  }, []);

  const getAppointmentsByTherapist = useCallback(async (therapistId: string): Promise<Appointment[]> => {
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(name, email, phone),
          therapist:therapists(name, email)
        `)
        .eq('therapist_id', therapistId)
        .order('date', { ascending: true });
      
      if (fetchError) {
        throw fetchError;
      }
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar agendamentos do terapeuta';
      setError(errorMessage);
      console.error('Erro ao buscar agendamentos por terapeuta:', err);
      return [];
    }
  }, []);

  const refreshAppointments = useCallback(async () => {
    await fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    getAppointmentsByTherapist,
    refreshAppointments
  };
};