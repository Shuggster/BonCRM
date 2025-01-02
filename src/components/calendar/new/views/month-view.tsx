"use client"

import { useState } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, subMonths, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { DraggableEvent } from '../DraggableEvent'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEventDrop?: (event: CalendarEvent, newStart: Date) => void
  currentDate: Date
  onDateChange?: (date: Date) => void
}

function DroppableDay({ day, isCurrentMonth, children }: { 
  day: Date, 
  isCurrentMonth: boolean,
  children: React.ReactNode 
}) {
  const { setNodeRef } = useDroppable({
    id: day.toISOString()
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "min-h-[150px] p-3",
        "transition-colors duration-200",
        isCurrentMonth ? "bg-[#111111]" : "bg-[#111111]/50",
        isToday(day) && "ring-1 ring-green-500/20"
      )}
    >
      {children}
    </motion.div>
  )
}

export function MonthView({ events, onEventClick, onEventDrop, currentDate, onDateChange }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over || !onEventDrop) return

    const draggedEvent = event.active.data.current as CalendarEvent
    const dropDate = new Date(event.over.id)
    onEventDrop(draggedEvent, dropDate)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-white/[0.02] rounded-xl overflow-hidden">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-sm font-medium text-zinc-400 p-3 text-center bg-[#111111]/80"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <DroppableDay 
                key={day.toISOString()} 
                day={day}
                isCurrentMonth={isCurrentMonth}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium rounded-md px-2 py-1",
                    !isCurrentMonth && "text-zinc-600",
                    isToday(day) && "bg-green-500/10 text-green-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1.5">
                  {dayEvents.map((event) => (
                    <DraggableEvent
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs rounded-lg",
                        "bg-green-500/10 text-green-400 font-medium",
                        "hover:bg-green-500/20 transition-colors duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      )}
                    />
                  ))}
                </div>
              </DroppableDay>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
} 