'use client'

import { useState, useEffect } from 'react'
import { CalendarEvent } from '@/types/calendar'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
  differenceInDays,
  addDays,
  startOfWeek,
  endOfWeek,
  differenceInMinutes
} from 'date-fns'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface CalendarGridProps {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
  onEventDrop?: (event: CalendarEvent, newStart: Date) => void
}

interface EventWithPosition extends CalendarEvent {
  position: number
  span: number
}

const EVENT_COLORS = [
  'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500',
  'bg-purple-500/10 hover:bg-purple-500/20 text-purple-500',
  'bg-green-500/10 hover:bg-green-500/20 text-green-500',
  'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500',
  'bg-pink-500/10 hover:bg-pink-500/20 text-pink-500'
]

function EventItem({ event, color, onClick }: { event: CalendarEvent; color: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        console.log('Event clicked in EventItem:', event)
        onClick(e)
      }}
      className={cn(
        'w-full text-left px-2 py-1 rounded text-xs truncate transition-colors cursor-pointer',
        color
      )}
    >
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-current" />
        <span>{format(event.start, 'HH:mm')}</span>
        <span className="truncate">{event.title}</span>
      </div>
    </button>
  )
}

function CalendarDay({
  day,
  isCurrentMonth,
  events,
  onEventClick,
  onDayClick
}: {
  day: Date
  isCurrentMonth: boolean
  events: EventWithPosition[]
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
}) {
  return (
    <div
      className={cn(
        'min-h-[120px] bg-zinc-900 p-2 relative group cursor-pointer',
        !isCurrentMonth && 'bg-zinc-900/50 text-zinc-600',
        isToday(day) && 'bg-zinc-800'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onDayClick(day)
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-sm',
            isToday(day) && 'font-bold text-blue-500'
          )}
        >
          {format(day, 'd')}
        </span>
        {events.length > 0 && (
          <span className="text-xs text-zinc-400">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="mt-1 space-y-1">
        {events.map((event) => (
          event.span > 0 ? (
            <EventItem
              key={event.id}
              event={event}
              color={EVENT_COLORS[event.position % EVENT_COLORS.length]}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                console.log('Event clicked in CalendarDay:', event)
                onEventClick(event)
              }}
            />
          ) : null
        ))}
      </div>
      {/* Add event indicator */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
        <div className="absolute bottom-2 right-2">
          <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
            +
          </div>
        </div>
      </div>
    </div>
  )
}

export function CalendarGrid({ events, currentDate, onEventClick, onDayClick }: CalendarGridProps) {
  const [days, setDays] = useState<Date[]>([])
  const [eventsByDay, setEventsByDay] = useState<Map<string, EventWithPosition[]>>(new Map())

  useEffect(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const daysInView = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    setDays(daysInView)

    // Process events to handle multi-day events
    const eventMap = new Map<string, EventWithPosition[]>()
    const positionMap = new Map<string, number[]>() // Track used positions for each day

    events.forEach(event => {
      const startDay = startOfDay(event.start)
      const endDay = endOfDay(event.end)
      const daySpan = differenceInDays(endDay, startDay) + 1

      // Find the first available position for this event
      let position = 0
      let positionFound = false
      while (!positionFound) {
        positionFound = true
        for (let i = 0; i < daySpan; i++) {
          const day = addDays(startDay, i)
          const dayKey = format(day, 'yyyy-MM-dd')
          const usedPositions = positionMap.get(dayKey) || []
          if (usedPositions.includes(position)) {
            position++
            positionFound = false
            break
          }
        }
      }

      // Mark the position as used for all days this event spans
      for (let i = 0; i < daySpan; i++) {
        const day = addDays(startDay, i)
        const dayKey = format(day, 'yyyy-MM-dd')
        const usedPositions = positionMap.get(dayKey) || []
        positionMap.set(dayKey, [...usedPositions, position])

        const eventWithPosition: EventWithPosition = {
          ...event,
          position,
          span: i === 0 ? daySpan : 0 // Only show span on the first day
        }

        const existingEvents = eventMap.get(dayKey) || []
        eventMap.set(dayKey, [...existingEvents, eventWithPosition])
      }
    })

    setEventsByDay(eventMap)
  }, [currentDate, events])

  return (
    <DndProvider backend={HTML5Backend}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-7 gap-px bg-white/[0.08] rounded-lg overflow-hidden"
      >
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-zinc-900 p-2 text-center text-sm font-medium text-zinc-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDay.get(dayKey) || []

          return (
            <CalendarDay
              key={day.toString()}
              day={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              events={dayEvents}
              onEventClick={onEventClick}
              onDayClick={onDayClick}
            />
          )
        })}
      </motion.div>
    </DndProvider>
  )
} 