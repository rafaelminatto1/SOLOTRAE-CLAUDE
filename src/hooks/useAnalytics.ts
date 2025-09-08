import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  completedSessions: number;
  canceledSessions: number;
  averageSessionDuration: number;
  patientSatisfaction: number;
  monthlyRevenue: number;
  topTreatments: Array<{
    name: string;
    count: number;
  }>;
  weeklyStats: Array<{
    day: string;
    appointments: number;
    revenue: number;
  }>;
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  getPatientAnalytics: (patientId: string) => Promise<any>;
  getTherapistAnalytics: (therapistId: string) => Promise<any>;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch patients count
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      // Fetch appointments count
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });
      
      // Fetch completed sessions
      const { count: completedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      // Fetch canceled sessions
      const { count: canceledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'canceled');
      
      // Mock data for complex analytics (replace with actual queries)
      const mockAnalytics: AnalyticsData = {
        totalPatients: patientsCount || 0,
        totalAppointments: appointmentsCount || 0,
        completedSessions: completedCount || 0,
        canceledSessions: canceledCount || 0,
        averageSessionDuration: 45, // minutes
        patientSatisfaction: 4.7, // out of 5
        monthlyRevenue: 15000, // R$
        topTreatments: [
          { name: 'Fisioterapia Ortopédica', count: 45 },
          { name: 'Fisioterapia Neurológica', count: 32 },
          { name: 'Fisioterapia Respiratória', count: 28 },
          { name: 'Fisioterapia Esportiva', count: 21 }
        ],
        weeklyStats: [
          { day: 'Segunda', appointments: 12, revenue: 1800 },
          { day: 'Terça', appointments: 15, revenue: 2250 },
          { day: 'Quarta', appointments: 18, revenue: 2700 },
          { day: 'Quinta', appointments: 14, revenue: 2100 },
          { day: 'Sexta', appointments: 16, revenue: 2400 },
          { day: 'Sábado', appointments: 8, revenue: 1200 },
          { day: 'Domingo', appointments: 3, revenue: 450 }
        ]
      };
      
      setData(mockAnalytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar analytics';
      setError(errorMessage);
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPatientAnalytics = useCallback(async (patientId: string) => {
    setError(null);
    
    try {
      // Fetch patient-specific data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId);
      
      const { data: soapRecords } = await supabase
        .from('soap_records')
        .select('*')
        .eq('patient_id', patientId);
      
      return {
        totalAppointments: appointments?.length || 0,
        completedSessions: appointments?.filter(apt => apt.status === 'completed').length || 0,
        totalSOAPRecords: soapRecords?.length || 0,
        lastSession: appointments?.[0]?.date || null,
        progressNotes: soapRecords?.length || 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar analytics do paciente';
      setError(errorMessage);
      console.error('Erro ao buscar analytics do paciente:', err);
      return null;
    }
  }, []);

  const getTherapistAnalytics = useCallback(async (therapistId: string) => {
    setError(null);
    
    try {
      // Fetch therapist-specific data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapistId);
      
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', therapistId);
      
      return {
        totalPatients: patientsCount || 0,
        totalAppointments: appointments?.length || 0,
        completedSessions: appointments?.filter(apt => apt.status === 'completed').length || 0,
        thisMonthAppointments: appointments?.filter(apt => {
          const aptDate = new Date(apt.date);
          const now = new Date();
          return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
        }).length || 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar analytics do terapeuta';
      setError(errorMessage);
      console.error('Erro ao buscar analytics do terapeuta:', err);
      return null;
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refreshAnalytics,
    getPatientAnalytics,
    getTherapistAnalytics
  };
};