"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from "framer-motion"
import { format, addMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface ResizableEventProps {
  event: CalendarEvent
  onClick?: () => void
  onResize?: (newStart: Date, newEnd: Date) => void
  containerHeight: number
}

export function ResizableEvent({ event, onClick, onResize, containerHeight }: ResizableEventProps) {
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const initialY = useRef<number>(0)
  const initialDate = useRef<Date>(new Date())

  const handleResizeStart = (e: React.MouseEvent, direction: 'top' | 'bottom') => {
    e.stopPropagation()
    setIsResizing(direction)
    initialY.current = e.clientY
    initialDate.current = direction === 'top' ? new Date(event.start) : new Date(event.end)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - initialY.current
      const minutesDelta = Math.round((deltaY / containerHeight) * 24 * 60)

      if (isResizing === 'top') {
        const newStart = addMinutes(initialDate.current, minutesDelta)
        // Ensure new start is before end and at least 30 minutes duration
        if (newStart < event.end && (event.end.getTime() - newStart.getTime()) >= 30 * 60 * 1000) {
          onResize?.(newStart, event.end)
        }
      } else {
        const newEnd = addMinutes(initialDate.current, minutesDelta)
        // Ensure new end is after start and at least 30 minutes duration
        if (newEnd > event.start && (newEnd.getTime() - event.start.getTime()) >= 30 * 60 * 1000) {
          onResize?.(event.start, newEnd)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, event, containerHeight, onResize])

  return (
    <div
      ref={eventRef}
      className={cn(
        "absolute inset-0 rounded-md",
        "bg-white/5 hover:bg-white/10 transition-colors",
        "border-l-2",
        EVENT_CATEGORIES[event.category || 'default']?.borderClass,
        isResizing && "select-none ring-1 ring-purple-500"
      )}
    >
      {/* Top resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 bg-transparent hover:bg-purple-500/20 cursor-ns-resize"
        onMouseDown={(e) => handleResizeStart(e, 'top')}
      />

      {/* Event content */}
      <div className="px-2 py-1" onClick={onClick}>
        <div className="text-sm font-medium truncate">{event.title}</div>
        <div className="text-xs text-muted-foreground">
          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
        </div>
      </div>

      {/* Bottom resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-transparent hover:bg-purple-500/20 cursor-ns-resize"
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
      />
    </div>
  )
} 