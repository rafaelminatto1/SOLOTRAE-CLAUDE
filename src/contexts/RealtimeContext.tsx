import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useRealtimeProgress } from '../hooks/useRealtimeProgress';
import { useRealtimeTreatmentPlans } from '../hooks/useRealtimeTreatmentPlans';
import { useAuthStore } from '../stores/authStore';
import type { Notification, TreatmentPlan } from '@shared/types';

interface RealtimeContextType {
  // Notifications
  notifications: any[]
  unreadCount: number
  
  // Progress
  progressEntries: any[]
  latestProgress: any | null
  
  // Treatment Plans
  treatmentPlans: any[]
  activePlans: any[]
  
  // Connection status
  isConnected: boolean
  connectionError: string | null
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Alias for compatibility
export const useRealtimeContext = useRealtime;

interface RealtimeProviderProps {
  children: React.ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, isAuthenticated } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  // Initialize realtime hooks
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount
  } = useRealtimeNotifications()

  const {
    progressEntries,
    latestEntry: latestProgress,
    setProgressEntries,
    setLatestEntry
  } = useRealtimeProgress({
    enabled: isAuthenticated
  })

  const {
    treatmentPlans,
    activePlans,
    setTreatmentPlans,
    setActivePlans
  } = useRealtimeTreatmentPlans({
    enabled: isAuthenticated
  })

  // Monitor connection status
  useEffect(() => {
    if (!isAuthenticated) {
      setIsConnected(false)
      setConnectionError(null)
      return
    }

    // Simulate connection monitoring
    // In a real implementation, you would monitor the Supabase connection status
    const checkConnection = () => {
      try {
        setConnectionStatus('connecting')
        setIsConnected(true)
        setConnectionError(null)
        setConnectionStatus('connected')
      } catch (error) {
        setIsConnected(false)
        setConnectionError('Failed to connect to realtime service')
        setConnectionStatus('disconnected')
        console.error('Realtime connection error:', error)
      }
    }

    checkConnection()

    // Check connection periodically
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated])

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      setProgressEntries([])
      setLatestEntry(null)
      setTreatmentPlans([])
      setActivePlans([])
    }
  }, [isAuthenticated, setNotifications, setUnreadCount, setProgressEntries, setLatestEntry, setTreatmentPlans, setActivePlans])

  const contextValue: RealtimeContextType = {
    // Notifications
    notifications,
    unreadCount,
    
    // Progress
    progressEntries,
    latestProgress,
    
    // Treatment Plans
    treatmentPlans,
    activePlans,
    
    // Connection status
    isConnected,
    connectionError,
    connectionStatus
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

// Connection status indicator component
export function RealtimeConnectionStatus() {
  const { isConnected, connectionError } = useRealtime()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {connectionError ? (
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm">Conexão perdida</span>
        </div>
      ) : isConnected ? (
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 opacity-75">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span className="text-sm">Conectado</span>
        </div>
      ) : (
        <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm">Conectando...</span>
        </div>
      )}
    </div>
  )
}