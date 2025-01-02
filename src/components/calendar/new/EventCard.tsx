"use client"

import { CalendarEvent } from '@/types/calendar'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'

interface EventCardProps {
  event: CalendarEvent
  onClick: () => void
  className?: string
  showTime?: boolean
}

export function EventCard({ 
  event, 
  onClick, 
  className,
  showTime = true 
}: EventCardProps) {
  const category = event.category || 'default'
  const categoryData = EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES]

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-1",
        "text-xs p-3 rounded-lg",
        "bg-[#1C2333]/50 backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-lg shadow-black/20",
        "hover:bg-[#1C2333]/80 transition-all duration-200",
        "border-l-2",
        categoryData?.borderClass || EVENT_CATEGORIES.default.borderClass,
        "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium truncate text-zinc-200">{event.title}</span>
        {event.recurrence && (
          <RefreshCw className="h-3 w-3 text-zinc-400 flex-shrink-0" />
        )}
      </div>
      {showTime && (
        <div className="text-xs text-zinc-400">
          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
        </div>
      )}
      {event.description && (
        <div className="text-xs text-zinc-400 truncate">
          {event.description}
        </div>
      )}
    </div>
  )
} 