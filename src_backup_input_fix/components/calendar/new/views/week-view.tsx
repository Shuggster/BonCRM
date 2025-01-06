"use client"

import { useState } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { ResizableEvent } from '../ResizableEvent'

interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEventDrop?: (event: CalendarEvent, newStart: Date) => void
  onEventCreate?: (start: Date, end: Date) => void
  onEventResize?: (event: CalendarEvent, start: Date, end: Date) => void
  currentDate: Date
  onDateChange?: (date: Date) => void
}

function getEventPositionClasses(event: CalendarEvent) {
  const startPercent = (new Date(event.start).getHours() / 24) * 100
  const heightPercent = ((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60 * 24)) * 100
  
  return {
    top: `${startPercent}%`,
    height: `${heightPercent}%`
  }
}

function DroppableDay({ day, children }: { day: Date, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: day.toISOString()
  })

  return (
    <div 
      ref={setNodeRef}
      className="min-h-[600px] p-2 border-r border-white/[0.08] relative"
    >
      {children}
    </div>
  )
}

export function WeekView({ 
  events, 
  onEventClick, 
  onEventDrop, 
  onEventCreate,
  onEventResize,
  currentDate,
  onDateChange
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Split hours into business and non-business
  const businessHours = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM
  const nonBusinessHours = [
    ...Array.from({ length: 7 }, (_, i) => i), // 12 AM to 6 AM
    ...Array.from({ length: 5 }, (_, i) => i + 19) // 7 PM to 11 PM
  ]

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start), date))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over || !onEventDrop) return

    const draggedEvent = event.active.data.current as CalendarEvent
    const dropDate = new Date(event.over.id)
    
    // Keep the same time, just change the date
    const newStart = new Date(dropDate)
    newStart.setHours(
      new Date(draggedEvent.start).getHours(),
      new Date(draggedEvent.start).getMinutes()
    )
    
    onEventDrop(draggedEvent, newStart)
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-4">
        {/* Business Hours Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Business Hours</h3>
          <div className="grid grid-cols-8 gap-px bg-white/[0.02] rounded-lg">
            {/* Time column */}
            <div className="border-r border-white/[0.08]">
              <div className="h-16 border-b border-white/[0.08]" /> {/* Empty header cell */}
              {businessHours.map((hour) => (
                <div 
                  key={hour} 
                  className="h-[60px] -mt-3 flex items-center justify-center"
                >
                  <span className="text-xs text-zinc-500">
                    {format(new Date().setHours(hour, 0), 'ha')}
                  </span>
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day).filter(event => {
                const hour = new Date(event.start).getHours()
                return hour >= 7 && hour <= 18
              })
              return (
                <div key={day.toISOString()}>
                  {/* Day header */}
                  <div 
                    className={cn(
                      "h-16 p-2 text-center border-b border-white/[0.08]",
                      isToday(day) && "bg-blue-500/10"
                    )}
                  >
                    <div className="text-sm font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      "text-2xl font-bold",
                      isToday(day) ? "text-blue-500" : "text-zinc-400"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Time slots with events */}
                  <DroppableDay day={day}>
                    {businessHours.map((hour) => (
                      <div 
                        key={hour}
                        className="h-[60px] border-b border-white/[0.08] bg-white/[0.02]"
                      />
                    ))}
                    {dayEvents.map((event) => {
                      const position = getEventPositionClasses(event)
                      return (
                        <div 
                          key={event.id}
                          className="absolute left-2 right-2"
                          style={position}
                        >
                          <ResizableEvent
                            event={event}
                            onClick={() => onEventClick(event)}
                            onResize={onEventResize}
                            className={cn(
                              "w-full",
                              "bg-blue-500/10 text-blue-500",
                              "hover:bg-blue-500/20 transition-colors cursor-pointer"
                            )}
                          />
                        </div>
                      )
                    })}
                  </DroppableDay>
                </div>
              )
            })}
          </div>
        </div>

        {/* Non-Business Hours Section */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Outside Business Hours</h3>
          <div className="grid grid-cols-8 gap-px bg-white/[0.02] rounded-lg opacity-60">
            {/* Time column */}
            <div className="border-r border-white/[0.08]">
              {nonBusinessHours.map((hour) => (
                <div 
                  key={hour} 
                  className="h-[60px] -mt-3 flex items-center justify-center"
                >
                  <span className="text-xs text-zinc-500">
                    {format(new Date().setHours(hour, 0), 'ha')}
                  </span>
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day).filter(event => {
                const hour = new Date(event.start).getHours()
                return hour < 7 || hour > 18
              })
              return (
                <div key={day.toISOString()}>
                  {/* Time slots with events */}
                  <DroppableDay day={day}>
                    {nonBusinessHours.map((hour) => (
                      <div 
                        key={hour}
                        className="h-[60px] border-b border-white/[0.08]"
                      />
                    ))}
                    {dayEvents.map((event) => {
                      const position = getEventPositionClasses(event)
                      return (
                        <div 
                          key={event.id}
                          className="absolute left-2 right-2"
                          style={position}
                        >
                          <ResizableEvent
                            event={event}
                            onClick={() => onEventClick(event)}
                            onResize={onEventResize}
                            className={cn(
                              "w-full",
                              "bg-blue-500/10 text-blue-500",
                              "hover:bg-blue-500/20 transition-colors cursor-pointer"
                            )}
                          />
                        </div>
                      )
                    })}
                  </DroppableDay>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DndContext>
  )
} 