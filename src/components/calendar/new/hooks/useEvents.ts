"use client"

import { useState } from 'react'
import { CalendarEvent } from '@/types/calendar'

interface UseEventsProps {
  initialEvents: CalendarEvent[]
  onEventCreate?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
}

export function useEvents({
  initialEvents,
  onEventCreate,
  onEventUpdate,
  onEventDelete
}: UseEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsCreating(false)
  }

  const handleEventCreate = (event: CalendarEvent) => {
    setEvents([...events, event])
    onEventCreate?.(event)
  }

  const handleEventUpdate = (event: CalendarEvent) => {
    setEvents(events.map(e => e.id === event.id ? event : e))
    onEventUpdate?.(event)
  }

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
    onEventDelete?.(eventId)
  }

  const handleEventDrop = (event: CalendarEvent, newStart: Date) => {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime()
    const newEnd = new Date(newStart.getTime() + duration)
    
    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd
    }
    
    handleEventUpdate(updatedEvent)
  }

  const handleEventResize = (event: CalendarEvent, start: Date, end: Date) => {
    const updatedEvent = {
      ...event,
      start,
      end
    }
    
    handleEventUpdate(updatedEvent)
  }

  const cancelCreating = () => {
    setIsCreating(false)
  }

  return {
    events,
    selectedEvent,
    isCreating,
    handleEventClick,
    handleEventCreate,
    handleEventUpdate,
    handleEventDelete,
    handleEventDrop,
    handleEventResize,
    cancelCreating
  }
} 