import { useEffect } from 'react'
import { eventBus } from '@/lib/event-bus'

type EventCallback = (...args: any[]) => void

export function useEventBus(event: string, callback: EventCallback) {
  useEffect(() => {
    eventBus.on(event, callback)
    return () => eventBus.off(event, callback)
  }, [event, callback])
} 