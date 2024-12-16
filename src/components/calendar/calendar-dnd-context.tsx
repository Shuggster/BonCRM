"use client"

import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { differenceInDays, addDays, parseISO, startOfDay } from 'date-fns'
import { CalendarEvent } from "@/types/calendar"

interface CalendarDndContextProps {
  children: React.ReactNode
  onEventDrop: (event: CalendarEvent, newStart: Date) => void
}

export function CalendarDndContext({ children, onEventDrop }: CalendarDndContextProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const eventId = active.id as string
    const [, destinationDate] = over.id.toString().split('::')
    const draggedEvent = active.data.current as CalendarEvent
    
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
      {children}
    </DndContext>
  )
} 