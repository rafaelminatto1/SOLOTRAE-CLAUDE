import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface TreatmentPlan {
  id: string;
  patient_id: string;
  physiotherapist_id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export function useRealtimeTreatmentPlans() {
  const { user } = useAuth();
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Configurar canal de tempo real para planos de tratamento
    const channel = supabase
      .channel('treatment-plans')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'treatment_plans',
          filter: user.role === 'PACIENTE' 
            ? `patient_id=eq.${user.id}` 
            : `physiotherapist_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Treatment plan update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setTreatmentPlans(prev => [...prev, payload.new as TreatmentPlan]);
              toast.success('Novo plano de tratamento criado!');
              break;
            case 'UPDATE':
              setTreatmentPlans(prev => 
                prev.map(plan => 
                  plan.id === payload.new.id ? payload.new as TreatmentPlan : plan
                )
              );
              toast.info('Plano de tratamento atualizado!');
              break;
            case 'DELETE':
              setTreatmentPlans(prev => 
                prev.filter(plan => plan.id !== payload.old.id)
              );
              toast.info('Plano de tratamento removido');
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to treatment plans channel');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Error connecting to treatment plans channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user]);

  return {
    treatmentPlans,
    isConnected,
  };
}