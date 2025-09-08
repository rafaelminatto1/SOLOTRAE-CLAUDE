import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
}

interface RealtimeContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      return;
    }

    let channel: any;

    const setupRealtimeConnection = async () => {
      try {
        setConnectionStatus('connecting');

        // Carregar notificações existentes
        const { data: existingNotifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Erro ao carregar notificações:', error);
          toast.error('Erro ao carregar notificações');
          setConnectionStatus('error');
          return;
        }

        setNotifications(existingNotifications || []);

        // Configurar canal de tempo real
        channel = supabase
          .channel(`notifications:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev]);
              
              // Mostrar toast para nova notificação
              toast(newNotification.title, {
                description: newNotification.message,
                duration: 5000,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const updatedNotification = payload.new as Notification;
              setNotifications(prev => 
                prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
              );
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const deletedNotification = payload.old as Notification;
              setNotifications(prev => 
                prev.filter(n => n.id !== deletedNotification.id)
              );
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setConnectionStatus('connected');
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setConnectionStatus('error');
              toast.error('Erro na conexão em tempo real');
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false);
              setConnectionStatus('error');
              toast.error('Timeout na conexão em tempo real');
            }
          });

      } catch (error) {
        console.error('Erro ao configurar conexão em tempo real:', error);
        setConnectionStatus('error');
        toast.error('Erro ao configurar notificações em tempo real');
      }
    };

    setupRealtimeConnection();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [user]);

  const value: RealtimeContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}