import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Configurar canal de tempo real para notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev]);
              if (!newNotification.read) {
                setUnreadCount(prev => prev + 1);
                // Mostrar toast para nova notificação
                toast(newNotification.title, {
                  description: newNotification.message,
                  duration: 5000,
                });
              }
              break;
            case 'UPDATE':
              const updatedNotification = payload.new as Notification;
              setNotifications(prev => 
                prev.map(notification => 
                  notification.id === updatedNotification.id ? updatedNotification : notification
                )
              );
              // Atualizar contador de não lidas
              setUnreadCount(prev => {
                const oldNotification = notifications.find(n => n.id === updatedNotification.id);
                if (oldNotification && !oldNotification.read && updatedNotification.read) {
                  return Math.max(0, prev - 1);
                } else if (oldNotification && oldNotification.read && !updatedNotification.read) {
                  return prev + 1;
                }
                return prev;
              });
              break;
            case 'DELETE':
              const deletedNotification = payload.old as Notification;
              setNotifications(prev => 
                prev.filter(notification => notification.id !== deletedNotification.id)
              );
              if (!deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to notifications channel');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('Error connecting to notifications channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user, notifications]);

  // Função para marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Erro ao marcar notificação como lida');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  // Função para marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Erro ao marcar todas as notificações como lidas');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}