"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface MonthViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function MonthView({ events = [], onEventClick }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date))
    const end = endOfWeek(endOfMonth(date))
    return eachDayOfInterval({ start, end })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((day, dayIdx) => {
          const dayEvents = events.filter(event => isSameDay(new Date(event.start), day))
          
          return (
            <motion.div
              key={day.toString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: dayIdx * 0.01 }}
            >
              <div
                className={cn(
                  "min-h-[100px] p-2 rounded-lg hover:bg-white/5 transition-colors",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/40",
                  isSameDay(day, new Date()) && "bg-white/5 ring-1 ring-purple-500/20"
                )}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md truncate cursor-pointer",
                        "bg-white/5 hover:bg-white/10 transition-colors",
                        "border border-white/10",
                        "flex items-center gap-2"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          EVENT_CATEGORIES[event.category || 'default']?.bgClass
                        )}
                      />
                      <span>{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
