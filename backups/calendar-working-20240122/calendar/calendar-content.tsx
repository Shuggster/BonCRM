"use client"

import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { CalendarEvent } from "@/types/calendar"
import { differenceInDays, addDays, parseISO, startOfDay } from 'date-fns'
import { CalendarView } from './calendar-view'

interface CalendarContentProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (event: CalendarEvent, newStart: Date) => void
}

export function CalendarContent({ events, onEventClick, onEventDrop }: CalendarContentProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const eventId = active.id as string
    const [, destinationDate] = over.id.toString().split('::')
    const draggedEvent = events.find(e => e.id === eventId)
    
    if (!draggedEvent || !destinationDate) return

    const destinationDateTime = startOfDay(parseISO(destinationDate))
    const eventStartDate = startOfDay(draggedEvent.start)

    const daysDiff = differenceInDays(destinationDateTime, eventStartDate)

    const originalHours = draggedEvent.start.getHours()
    const originalMinutes = draggedEvent.start.getMinutes()
    
    let newStart = addDays(draggedEvent.start, daysDiff)
    newStart.setHours(originalHours)
    newStart.setMinutes(originalMinutes)

    onEventDrop(draggedEvent, newStart)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <CalendarView 
        events={events} 
        onEventClick={onEventClick}
        onEventDrop={onEventDrop}
      />
    </DndContext>
  )
} 