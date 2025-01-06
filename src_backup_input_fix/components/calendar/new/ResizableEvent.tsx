"use client"

import { useRef, useState } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { GripVertical } from 'lucide-react'

interface ResizableEventProps {
  event: CalendarEvent
  onClick: () => void
  onResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
  className?: string
}

export function ResizableEvent({ 
  event, 
  onClick, 
  onResize,
  className 
}: ResizableEventProps) {
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartRef = useRef<{ y: number; startTime: Date; endTime: Date } | null>(null)

  const handleResizeStart = (e: React.MouseEvent, edge: 'top' | 'bottom') => {
    e.stopPropagation()
    setIsResizing(true)
    
    const startTime = edge === 'top' ? event.start : event.end
    const endTime = edge === 'top' ? event.end : event.start
    
    resizeStartRef.current = {
      y: e.clientY,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return

      const deltaY = e.clientY - resizeStartRef.current.y
      const minutesDelta = Math.round(deltaY / 2) // 1px = 0.5 minutes
      
      const newTime = new Date(resizeStartRef.current.startTime)
      newTime.setMinutes(newTime.getMinutes() + minutesDelta)

      if (edge === 'top') {
        onResize?.(event, newTime, event.end)
      } else {
        onResize?.(event, event.start, newTime)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeStartRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const category = event.category || 'default'
  const categoryColor = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES]?.bgClass.split('-')[1] || 'blue'

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        "text-xs rounded-lg",
        "bg-[#1C2333]/50 backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-lg shadow-black/20",
        "hover:bg-[#1C2333]/80 transition-all duration-200",
        "border-l-2",
        `border-l-${categoryColor}-500`,
        isResizing && "ring-2 ring-purple-500/50 shadow-xl shadow-purple-500/20",
        className
      )}
    >
      {/* Top resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-[#1C2333]/80 transition-colors rounded-t-lg"
        onMouseDown={(e) => handleResizeStart(e, 'top')}
      />

      {/* Content */}
      <div className="flex-1 p-3" onClick={onClick}>
        <div className="flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-zinc-400 hover:text-zinc-300 transition-colors" />
          <span className="font-medium truncate text-zinc-200">{event.title}</span>
        </div>
        <div className="text-xs text-zinc-400 mt-1">
          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
        </div>
      </div>

      {/* Bottom resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-[#1C2333]/80 transition-colors rounded-b-lg"
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
      />
    </div>
  )
} 