import { useEffect, useState } from 'react'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
import type { Notification } from '@shared/types'

export function useRealtimeNotifications() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Handle new notifications
  const handleNewNotification = (payload: any) => {
    const newNotification = payload.new as Notification
    
    // Add to notifications list
    setNotifications(prev => [newNotification, ...prev])
    
    // Update unread count
    if (!newNotification.is_read) {
      setUnreadCount(prev => prev + 1)
    }
    
    // Show toast notification
    toast(newNotification.title, {
      description: newNotification.message,
      duration: 5000,
    })
  }

  // Handle notification updates (e.g., marked as read)
  const handleNotificationUpdate = (payload: any) => {
    const updatedNotification = payload.new as Notification
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === updatedNotification.id 
          ? updatedNotification 
          : notification
      )
    )
    
    // Update unread count if notification was marked as read
    if (payload.old.is_read === false && updatedNotification.is_read === true) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Handle notification deletion
  const handleNotificationDelete = (payload: any) => {
    const deletedNotification = payload.old as Notification
    
    setNotifications(prev => 
      prev.filter(notification => notification.id !== deletedNotification.id)
    )
    
    // Update unread count if deleted notification was unread
    if (!deletedNotification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Subscribe to notifications for the current user
  useRealtimeSubscription({
    table: 'notifications',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    onInsert: handleNewNotification,
    onUpdate: handleNotificationUpdate,
    onDelete: handleNotificationDelete,
    enabled: !!user
  })

  // Load initial notifications count
  useEffect(() => {
    if (user) {
      // This would typically be loaded from your notification store or API
      // For now, we'll just reset the count
      setUnreadCount(0)
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount
  }
}