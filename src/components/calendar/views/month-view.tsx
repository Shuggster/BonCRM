"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GripVertical, RefreshCw } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, differenceInMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface MonthViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventDrop?: (event: CalendarEvent, newStart: Date) => void
  currentDate: Date
}

const DraggableEvent = ({ event, onClick }: { event: CalendarEvent; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: event.id,
    data: event
  })

  const isMultiDay = !isSameDay(event.start, event.end)
  const duration = differenceInMinutes(event.end, event.start)

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const category = event.category as keyof typeof EVENT_CATEGORIES || 'default'
  const categoryColor = EVENT_CATEGORIES[category]?.bgClass.split('-')[1] || 'blue'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group flex items-center gap-2",
        "text-xs px-2 py-1 rounded-md",
        "bg-white/5 hover:bg-white/10 transition-colors",
        "border-l-2",
        `border-${categoryColor}-500`,
        isDragging && "ring-1 ring-purple-500 shadow-lg"
      )}
    >
      <div {...listeners} className="cursor-grab hover:cursor-grabbing">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{event.title}</span>
          {event.recurrence && (
            <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(event.start, 'h:mm a')}
          {!isMultiDay && ` - ${format(event.end, 'h:mm a')}`}
          {isMultiDay && ' - Multiple days'}
        </div>
      </div>
    </div>
  )
}

const DroppableDay = ({ dateStr, children }: { dateStr: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day::${dateStr}`,
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        isOver && "bg-purple-500/10 ring-1 ring-purple-500/30"
      )}
    >
      {children}
    </div>
  )
}

function EventCell({ event }: { event: CalendarEvent }) {
  const categoryStyles = {
    default: 'bg-blue-500/20 border-blue-500/30',
    meeting: 'bg-purple-500/20 border-purple-500/30',
    task: 'bg-green-500/20 border-green-500/30',
    reminder: 'bg-yellow-500/20 border-yellow-500/30'
  }

  const style = categoryStyles[event.category as keyof typeof categoryStyles] || categoryStyles.default

  return (
    <div className={`px-2 py-1 text-sm rounded border truncate ${style}`}>
      <div className="font-medium truncate">{event.title}</div>
      {event.assignee_name && (
        <div className="text-xs text-gray-400 truncate flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          {event.assignee_name}
        </div>
      )}
    </div>
  )
}

export function MonthView({ events = [], onEventClick, onEventDrop, currentDate }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(monthEnd) 
  })

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter(event => isSameDay(new Date(event.start), day))
          const dateStr = format(day, 'yyyy-MM-dd')
          
          return (
            <motion.div
              key={day.toString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: dayIdx * 0.01 }}
            >
              <DroppableDay dateStr={dateStr}>
                <div
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg transition-all duration-200",
                    !isSameMonth(day, currentDate) && "text-muted-foreground/40",
                    isSameDay(day, new Date()) && "bg-white/5 ring-1 ring-purple-500/20",
                    "hover:bg-white/5"
                  )}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <DraggableEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick?.(event)}
                      />
                    ))}
                  </div>
                </div>
              </DroppableDay>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
