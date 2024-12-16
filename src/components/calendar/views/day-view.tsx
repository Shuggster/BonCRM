"use client"

import { format, isSameDay } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'
import { motion } from 'framer-motion'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface DayViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function DayView({ events = [], onEventClick }: DayViewProps) {
  const today = new Date()
  console.log('DayView received events:', events)
  
  const dayEvents = events?.filter(event => isSameDay(new Date(event.start), today)) || []
  console.log('Filtered day events:', dayEvents)

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
          {format(today, 'EEEE, MMMM d')}
        </h2>
      </div>
      <div className="divide-y divide-white/10">
        {Array.from({ length: 24 }, (_, hour) => {
          const timeSlotEvents = dayEvents.filter(event => {
            const eventHour = new Date(event.start).getHours()
            return eventHour === hour
          })

          return (
            <div key={hour} className="p-4 relative group hover:bg-white/5">
              <div className="text-sm text-muted-foreground">
                {format(new Date().setHours(hour), 'ha')}
              </div>
              {timeSlotEvents.map(event => {
                const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-2 p-2 rounded-lg cursor-pointer",
                      "bg-white/5 hover:bg-white/10",
                      "border border-white/10"
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          EVENT_CATEGORIES[event.category || 'default']?.bgClass
                        )}
                      />
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {format(event.start, 'h:mm a')} • {duration}min
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
