'use client'

import { useMemo } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { format } from 'date-fns'
import { Calendar, Clock, User } from 'lucide-react'

interface CalendarEventsListProps {
  events: CalendarEvent[]
  title: string
}

export function CalendarEventsList({ events, title }: CalendarEventsListProps) {
  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = events.reduce((acc: { [key: string]: CalendarEvent[] }, event) => {
      const dateKey = format(new Date(event.start), 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    }, {})

    // Sort dates and events within each date
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({
        date: new Date(date),
        events: events.sort((a, b) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        )
      }))
  }, [events])

  return (
    <div className="h-full flex flex-col bg-[#111111] rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-sm text-zinc-400">{events.length} events</span>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-auto">
        {groupedEvents.map(({ date, events }) => (
          <div key={date.toISOString()} className="border-b border-white/[0.08] last:border-b-0">
            {/* Date Header */}
            <div className="px-6 py-3 bg-white/[0.02] sticky top-0">
              <div className="text-sm font-medium text-zinc-400">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            {/* Events for this date */}
            <div className="divide-y divide-white/[0.08]">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Time */}
                    <div className="w-16 flex-none">
                      <div className="text-sm font-medium text-white">
                        {format(new Date(event.start), 'h:mm a')}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-x-4">
                        <div>
                          <h3 className="text-sm font-medium text-white truncate">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Priority Indicator */}
                        {event.priority && (
                          <div className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${event.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'}
                          `}>
                            {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                        </div>
                        {event.category && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.category}
                          </div>
                        )}
                        {event.contact_id && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Contact
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Calendar className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-sm font-medium text-zinc-400">No events found</h3>
            <p className="text-sm text-zinc-600 mt-1">There are no events to display for this view.</p>
          </div>
        )}
      </div>
    </div>
  )
} 