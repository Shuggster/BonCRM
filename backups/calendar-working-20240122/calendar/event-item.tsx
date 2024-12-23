"use client"

import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/types/calendar"
import { EVENT_CATEGORIES } from "@/lib/constants/categories"

interface EventItemProps {
  event: CalendarEvent
  onClick?: () => void
  isStart?: boolean
  isEnd?: boolean
}

export function EventItem({ event, onClick, isStart = true, isEnd = true }: EventItemProps) {
  const isMultiDay = !isSameDay(event.start, event.end)

  return (
    <div
      className={cn(
        "absolute inset-0",
        "bg-white/5 hover:bg-white/10 transition-colors cursor-pointer",
        "border-l-2",
        EVENT_CATEGORIES[event.category || 'default']?.borderClass,
        !isStart && "rounded-l-none border-l-0",
        !isEnd && "rounded-r-none",
        isStart && "rounded-l-md",
        isEnd && "rounded-r-md"
      )}
      onClick={onClick}
    >
      <div className="px-2 py-1">
        <div className="text-sm font-medium truncate">
          {!isStart && "↰ "}{event.title}{!isEnd && " ↲"}
        </div>
        <div className="text-xs text-muted-foreground">
          {isStart ? format(event.start, 'h:mm a') : '•••'} 
          {' - '} 
          {isEnd ? format(event.end, 'h:mm a') : '•••'}
        </div>
      </div>
    </div>
  )
} 