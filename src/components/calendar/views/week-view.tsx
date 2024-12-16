"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Grid, List } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, set } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"
import { layoutEvents } from "@/lib/utils/events"

interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventDrop?: (event: CalendarEvent, newStart: Date) => void
  currentDate: Date
}

const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 20,  // 8 PM
}

export function WeekView({ events = [], onEventClick, onEventDrop, currentDate }: WeekViewProps) {
  const [showFullDay, setShowFullDay] = useState(false)
  const [viewType, setViewType] = useState<'timeline' | 'grid'>('timeline')

  const startHour = showFullDay ? 0 : BUSINESS_HOURS.start
  const endHour = showFullDay ? 24 : BUSINESS_HOURS.end
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const TimelineView = () => (
    <div className="grid grid-cols-8 gap-px bg-white/5 rounded-lg overflow-hidden h-[calc(80px*(var(--total-hours)))]" 
      style={{ '--total-hours': hours.length } as any}
    >
      {/* Time Labels */}
      <div className="col-span-1 bg-[#0F1629]/50">
        <div className="h-12 border-b border-white/5" /> {/* Header spacer */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-20 border-b border-white/5 flex items-center px-2"
          >
            <span className="text-xs text-muted-foreground">
              {format(set(new Date(), { hours: hour }), 'h a')}
            </span>
          </div>
        ))}
      </div>

      {/* Days */}
      {days.map((day) => {
        const dayEvents = layoutEvents(events.filter(event => isSameDay(event.start, day)))
        
        return (
          <div key={day.toString()} className="col-span-1 relative">
            {/* Day Header */}
            <div className="h-12 flex flex-col items-center justify-center border-b border-white/5 bg-[#0F1629]/50 sticky top-0 z-10">
              <span className="text-sm font-medium">
                {format(day, 'EEE')}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(day, 'd')}
              </span>
            </div>

            {/* Events */}
            <div className="relative h-full">
              {/* Hour lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full h-20 border-b border-white/5"
                  style={{ top: (hour - startHour) * 80 }}
                />
              ))}

              {dayEvents.map((event) => {
                const eventStartHour = event.start.getHours()
                const startMinutes = (eventStartHour * 60 + event.start.getMinutes())
                const endMinutes = (event.end.getHours() * 60 + event.end.getMinutes())
                const duration = endMinutes - startMinutes

                // Adjust position based on business hours
                const adjustedStart = startMinutes - (startHour * 60)
                const top = `${(adjustedStart / (hours.length * 60)) * 100}%`
                const height = `${(duration / (hours.length * 60)) * 100}%`

                const columnWidth = 100 / event.totalColumns
                const left = event.column * columnWidth
                const width = (columnWidth * event.width) - 1

                return (
                  <div
                    key={event.id}
                    className="absolute px-1"
                    style={{
                      top,
                      height,
                      left: `${left}%`,
                      width: `${width}%`
                    }}
                  >
                    <div
                      className={cn(
                        "h-full rounded-md p-2 cursor-pointer",
                        "bg-white/5 hover:bg-white/10 transition-colors",
                        "border-l-2",
                        EVENT_CATEGORIES[event.category || 'default']?.borderClass
                      )}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="text-sm font-medium truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )

  const GridView = () => (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayEvents = layoutEvents(events.filter(event => isSameDay(event.start, day)))
        
        return (
          <div key={day.toString()} className="space-y-4">
            <div className="text-center">
              <div className="text-sm font-medium">{format(day, 'EEEE')}</div>
              <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
            </div>
            
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-2 rounded-md cursor-pointer",
                    "bg-white/5 hover:bg-white/10 transition-colors",
                    "border-l-2",
                    EVENT_CATEGORIES[event.category || 'default']?.borderClass
                  )}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="text-sm font-medium truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullDay(!showFullDay)}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            {showFullDay ? '24 Hours' : 'Business Hours'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewType(viewType === 'timeline' ? 'grid' : 'timeline')}
            className="gap-2"
          >
            {viewType === 'timeline' ? (
              <><Grid className="h-4 w-4" /> Grid</>
            ) : (
              <><List className="h-4 w-4" /> Timeline</>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        {viewType === 'timeline' ? <TimelineView /> : <GridView />}
      </div>
    </div>
  )
}
