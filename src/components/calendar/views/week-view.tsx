"use client"

import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'
import { motion } from 'framer-motion'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function WeekView({ events = [], onEventClick }: WeekViewProps) {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-px bg-white/5">
        {weekDays.map((day) => (
          <div 
            key={day.toString()}
            className={cn(
              "p-2 text-sm font-medium text-center",
              isSameDay(day, today) && "bg-white/5"
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div className="text-muted-foreground">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="divide-y divide-white/10">
        {Array.from({ length: 24 }, (_, hour) => {
          const hourEvents = events.filter(event => {
            const eventHour = new Date(event.start).getHours()
            const eventDay = new Date(event.start)
            return eventHour === hour && weekDays.some(day => isSameDay(day, eventDay))
          })

          return (
            <div key={hour} className="grid grid-cols-7 gap-px">
              {weekDays.map(day => {
                const dayEvents = hourEvents.filter(event => 
                  isSameDay(new Date(event.start), day)
                )

                return (
                  <div key={day.toString()} className="p-2 min-h-[60px] relative group hover:bg-white/5">
                    <div className="text-xs text-muted-foreground">
                      {format(new Date().setHours(hour), 'ha')}
                    </div>
                    {dayEvents.map(event => {
                      const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "mt-1 p-1 rounded-md cursor-pointer",
                            "bg-white/5 hover:bg-white/10",
                            "border border-white/10"
                          )}
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="flex items-center gap-1">
                            <div 
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                EVENT_CATEGORIES[event.category || 'default']?.bgClass
                              )}
                            />
                            <span className="text-xs font-medium truncate">{event.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(event.start, 'h:mm a')} • {duration}min
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
