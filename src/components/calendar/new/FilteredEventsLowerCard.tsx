'use client'

import { CalendarEvent } from '@/types/calendar'
import { CalendarEventsList } from './CalendarEventsList'

interface FilteredEventsLowerCardProps {
  events: CalendarEvent[]
  title?: string
}

export function FilteredEventsLowerCard({ events, title = '' }: FilteredEventsLowerCardProps) {
  return (
    <div className="h-full rounded-b-2xl bg-[#111111] border-t border-white/[0.08] p-6">
      <CalendarEventsList events={events} title={title} />
    </div>
  )
} 