"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Grid, List } from "lucide-react"
import { format, isSameDay, set } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/types/calendar"
import { layoutEvents } from "@/lib/utils/events"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface DayViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventCreate?: (start: Date, end: Date) => void
  currentDate: Date
}

const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 20,  // 8 PM
}

export function DayView({ events = [], onEventClick, onEventCreate, currentDate }: DayViewProps) {
  const [showFullDay, setShowFullDay] = useState(false)
  const [viewType, setViewType] = useState<'timeline' | 'grid'>('timeline')
  const gridRef = useRef<HTMLDivElement>(null)

  const startHour = showFullDay ? 0 : BUSINESS_HOURS.start
  const endHour = showFullDay ? 24 : BUSINESS_HOURS.end
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const dayEvents = events.filter(event => isSameDay(event.start, currentDate))
  const layoutedEvents = layoutEvents(dayEvents)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ hour: number; minutes: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ hour: number; minutes: number } | null>(null)

  const getTimeFromMouseEvent = (e: React.MouseEvent) => {
    if (!gridRef.current) return null

    const rect = gridRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const totalMinutes = (y / rect.height) * (24 * 60)
    const hour = Math.floor(totalMinutes / 60)
    const minutes = Math.round((totalMinutes % 60) / 15) * 15

    return { hour: Math.max(0, Math.min(23, hour)), minutes }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const time = getTimeFromMouseEvent(e)
    if (!time) return

    setIsDragging(true)
    setDragStart(time)
    setDragEnd(time)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const time = getTimeFromMouseEvent(e)
    if (!time) return

    setDragEnd(time)
  }

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return

    const startDate = new Date(currentDate)
    startDate.setHours(dragStart.hour, dragStart.minutes)

    const endDate = new Date(currentDate)
    endDate.setHours(dragEnd.hour, dragEnd.minutes)

    if (endDate > startDate) {
      onEventCreate?.(startDate, endDate)
    } else {
      onEventCreate?.(endDate, startDate)
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  const getDragSelection = () => {
    if (!dragStart || !dragEnd) return null

    const startPercent = (dragStart.hour * 60 + dragStart.minutes) / (24 * 60) * 100
    const endPercent = (dragEnd.hour * 60 + dragEnd.minutes) / (24 * 60) * 100
    const top = Math.min(startPercent, endPercent)
    const height = Math.abs(endPercent - startPercent)

    return (
      <div
        className="absolute left-16 right-2 bg-purple-500/20 border border-purple-500/30 rounded-md pointer-events-none"
        style={{
          top: `${top}%`,
          height: `${height}%`
        }}
      />
    )
  }

  const TimelineView = () => (
    <div className="relative h-[calc(80px*(var(--total-hours)))]" style={{ '--total-hours': hours.length } as any}>
      {/* Time Labels Column */}
      <div className="absolute left-0 top-0 w-16 h-full bg-[#0F1629]/50 z-10">
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

      {/* Main Content Area with Events */}
      <div className="ml-16 relative h-full">
        {/* Hour Grid Lines */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute w-full h-20 border-b border-white/5"
            style={{ top: (hour - startHour) * 80 }}
          />
        ))}

        {/* Events */}
        {layoutedEvents.map((event) => {
          const eventStartHour = event.start.getHours()
          const startMinutes = (eventStartHour * 60 + event.start.getMinutes())
          const endMinutes = (event.end.getHours() * 60 + event.end.getMinutes())
          const duration = endMinutes - startMinutes

          // Adjust position based on business hours
          const adjustedStart = startMinutes - (startHour * 60)
          const top = `${(adjustedStart / (hours.length * 60)) * 100}%`
          const height = `${(duration / (hours.length * 60)) * 100}%`

          return (
            <div
              key={event.id}
              className="absolute left-0 right-0 px-1"
              style={{ top, height }}
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

        {/* Selection Overlay */}
        {isDragging && getDragSelection()}
      </div>

      {/* Click Area for Event Creation */}
      <div 
        className="absolute inset-0 ml-16"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      />
    </div>
  )

  const GridView = () => (
    <div className="grid gap-4">
      {layoutedEvents.map((event) => (
        <div
          key={event.id}
          className={cn(
            "p-3 rounded-md cursor-pointer",
            "bg-white/5 hover:bg-white/10 transition-colors",
            "border-l-2",
            EVENT_CATEGORIES[event.category || 'default']?.borderClass
          )}
          onClick={() => onEventClick?.(event)}
        >
          <div className="text-sm font-medium">{event.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
          </div>
          {event.description && (
            <div className="text-sm text-muted-foreground mt-2">
              {event.description}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
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
