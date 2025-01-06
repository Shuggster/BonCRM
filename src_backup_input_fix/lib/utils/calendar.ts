import { format } from 'date-fns'
import { CalendarEvent } from '@/types/calendar'

interface GroupedEvents {
  date: Date
  events: CalendarEvent[]
}

export function groupEventsByDate(events: CalendarEvent[]): GroupedEvents[] {
  const groups = events.reduce((acc: { [key: string]: CalendarEvent[] }, event) => {
    const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd')
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
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    }))
} 