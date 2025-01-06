"use client"

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { CalendarEvent } from '@/types/calendar'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import { format, isSameDay } from 'date-fns'
import { GripVertical, RefreshCw } from 'lucide-react'

interface DraggableEventProps {
  event: CalendarEvent
  onClick: () => void
  className?: string
}

export function DraggableEvent({ event, onClick, className }: DraggableEventProps) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  }

  const isMultiDay = !isSameDay(event.start, event.end)
  const category = event.category || 'default'
  const categoryColor = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES]?.bgClass.split('-')[1] || 'blue'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group flex items-center gap-2",
        "text-xs p-3 rounded-lg",
        "bg-[#1C2333]/50 backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-lg shadow-black/20",
        "hover:bg-[#1C2333]/80 transition-all duration-200",
        "border-l-2",
        `border-l-${categoryColor}-500`,
        isDragging && "ring-2 ring-purple-500/50 shadow-xl shadow-purple-500/20",
        className
      )}
    >
      <div {...listeners} className="cursor-grab hover:cursor-grabbing">
        <GripVertical className="h-3 w-3 text-zinc-400 hover:text-zinc-300 transition-colors" />
      </div>
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center gap-2">
          <span className="font-medium truncate text-zinc-200">{event.title}</span>
          {event.recurrence && (
            <RefreshCw className="h-3 w-3 text-zinc-400 flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-zinc-400">
          {format(event.start, 'h:mm a')}
          {!isMultiDay && ` - ${format(event.end, 'h:mm a')}`}
          {isMultiDay && ' - Multiple days'}
        </div>
      </div>
    </div>
  )
} 