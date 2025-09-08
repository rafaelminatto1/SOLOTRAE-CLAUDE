import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProgressUpdate {
  id: string;
  patient_id: string;
  treatment_plan_id: string;
  session_date: string;
  notes: string;
  progress_score: number;
  created_at: string;
  updated_at: string;
}

export function useRealtimeProgress() {
  const { user } = useAuth();
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Configurar canal de tempo real para atualizações de progresso
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_updates',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Progress update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setProgressUpdates(prev => [...prev, payload.new as ProgressUpdate]);
              toast.success('Nova atualização de progresso recebida!');
              break;
            case 'UPDATE':
              setProgressUpdates(prev => 
                prev.map(update => 
                  update.id === payload.new.id ? payload.new as ProgressUpdate : update
                )
              );
              toast.info('Progresso atualizado!');
              break;
            case 'DELETE':
              setProgressUpdates(prev => 
                prev.filter(update => update.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to progress updates channel');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Error connecting to progress updates channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user]);

  return {
    progressUpdates,
    isConnected,
  };
}