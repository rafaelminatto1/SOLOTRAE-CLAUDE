import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SOAPRecord {
  id: string;
  patient_id: string;
  therapist_id: string;
  session_date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

interface UseSOAPRecordsReturn {
  records: SOAPRecord[];
  isLoading: boolean;
  error: string | null;
  createRecord: (record: Omit<SOAPRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<SOAPRecord | null>;
  updateRecord: (id: string, updates: Partial<SOAPRecord>) => Promise<SOAPRecord | null>;
  deleteRecord: (id: string) => Promise<boolean>;
  getRecordsByPatient: (patientId: string) => Promise<SOAPRecord[]>;
  refreshRecords: () => Promise<void>;
}

export const useSOAPRecords = (patientId?: string): UseSOAPRecordsReturn => {
  const [records, setRecords] = useState<SOAPRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('soap_records')
        .select('*')
        .order('session_date', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      setRecords(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar registros SOAP';
      setError(errorMessage);
      console.error('Erro ao buscar registros SOAP:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  const createRecord = useCallback(async (recordData: Omit<SOAPRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SOAPRecord | null> => {
    setError(null);
    
    try {
      const { data, error: createError } = await supabase
        .from('soap_records')
        .insert([recordData])
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      if (data) {
        setRecords(prev => [data, ...prev]);
        return data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar registro SOAP';
      setError(errorMessage);
      console.error('Erro ao criar registro SOAP:', err);
      return null;
    }
  }, []);

  const updateRecord = useCallback(async (id: string, updates: Partial<SOAPRecord>): Promise<SOAPRecord | null> => {
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('soap_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      if (data) {
        setRecords(prev => prev.map(record => 
          record.id === id ? data : record
        ));
        return data;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar registro SOAP';
      setError(errorMessage);
      console.error('Erro ao atualizar registro SOAP:', err);
      return null;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('soap_records')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      setRecords(prev => prev.filter(record => record.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir registro SOAP';
      setError(errorMessage);
      console.error('Erro ao excluir registro SOAP:', err);
      return false;
    }
  }, []);

  const getRecordsByPatient = useCallback(async (patientId: string): Promise<SOAPRecord[]> => {
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('soap_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar registros do paciente';
      setError(errorMessage);
      console.error('Erro ao buscar registros por paciente:', err);
      return [];
    }
  }, []);

  const refreshRecords = useCallback(async () => {
    await fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordsByPatient,
    refreshRecords
  };
};