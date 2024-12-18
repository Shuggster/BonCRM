"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export const useRealtimeSubscription = (
  table: string,
  event: RealtimeEvent,
  callback: (payload: any) => void
) => {
  useEffect(() => {
    console.log('[Realtime] Creating channel for', table)
    
    const channel = supabase
      .channel(`${table}_${event}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        callback
      )
      .subscribe()

    return () => {
      console.log('[Realtime] Cleaning up channel for', table)
      supabase.removeChannel(channel)
    }
  }, [table, event, callback])
} 