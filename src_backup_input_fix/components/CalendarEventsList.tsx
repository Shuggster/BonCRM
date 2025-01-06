import { CalendarEvent } from '@/types/calendar'
import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'

interface CalendarEventsListProps {
  events: CalendarEvent[]
}

export function CalendarEventsList({ events }: CalendarEventsListProps) {
  return (
    <div className="space-y-4">
      {events.map(event => (
        <Card 
          key={event.id}
          className="p-4 bg-white/5 border-white/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{event.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{event.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'secondary'}>
                  {event.priority}
                </Badge>
                <Badge variant="outline">{event.category}</Badge>
              </div>
            </div>
            <div className="text-right text-sm text-zinc-400">
              <p>{format(new Date(event.start), 'MMM d, yyyy')}</p>
              <p>{format(new Date(event.start), 'h:mm a')}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 