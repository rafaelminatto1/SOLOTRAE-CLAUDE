import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UseRealtimeSubscriptionOptions {
  table: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  enabled?: boolean
}

export function useRealtimeSubscription({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Create a unique channel name
    const channelName = `${table}_${filter || 'all'}_${Date.now()}`
    
    // Create the channel
    const channel = supabase.channel(channelName)

    // Configure the subscription
    let subscription = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      (payload) => {
        console.log('Realtime event:', payload)
        
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload)
            break
          case 'UPDATE':
            onUpdate?.(payload)
            break
          case 'DELETE':
            onDelete?.(payload)
            break
        }
      }
    )

    // Subscribe to the channel
    subscription.subscribe((status) => {
      console.log(`Subscription status for ${table}:`, status)
    })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log(`Unsubscribing from ${table} channel`)
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, filter, onInsert, onUpdate, onDelete, enabled])

  // Function to manually unsubscribe
  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  return { unsubscribe }
}