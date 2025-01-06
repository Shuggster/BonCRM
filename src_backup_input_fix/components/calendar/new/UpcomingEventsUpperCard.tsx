'use client'

import { Button } from '@/components/ui/button'
import { CalendarEvent } from '@/types/calendar'
import { format } from 'date-fns'
import { exportEventsToCSV } from '@/lib/utils/exportEvents'

interface UpcomingEventsUpperCardProps {
  events: CalendarEvent[]
  onCreateEvent: (event: Omit<CalendarEvent, 'id'>) => void
}

export function UpcomingEventsUpperCard({ events, onCreateEvent }: UpcomingEventsUpperCardProps) {
  const handleExport = () => {
    const filename = `upcoming-events-${format(new Date(), 'yyyy-MM-dd')}.csv`
    exportEventsToCSV(events, filename)
  }

  return (
    <div className="h-full rounded-t-2xl bg-[#111111] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={handleExport}
          >
            Export
          </Button>
          <span className="text-sm text-zinc-400">{events.length} events</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent group"
        >
          <div className="w-full p-4 rounded-lg bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-colors">
            <div className="text-sm text-zinc-400">Today</div>
            <div className="text-xl font-semibold text-white mt-1">
              {events.filter(e => new Date(e.start).toDateString() === new Date().toDateString()).length}
            </div>
          </div>
        </Button>
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent group"
        >
          <div className="w-full p-4 rounded-lg bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-colors">
            <div className="text-sm text-zinc-400">Tomorrow</div>
            <div className="text-xl font-semibold text-white mt-1">
              {events.filter(e => new Date(e.start).toDateString() === new Date(Date.now() + 86400000).toDateString()).length}
            </div>
          </div>
        </Button>
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent group"
        >
          <div className="w-full p-4 rounded-lg bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-colors">
            <div className="text-sm text-zinc-400">This Week</div>
            <div className="text-xl font-semibold text-white mt-1">
              {events.filter(e => {
                const date = new Date(e.start)
                const today = new Date()
                const nextWeek = new Date(today.getTime() + 7 * 86400000)
                return date > today && date <= nextWeek
              }).length}
            </div>
          </div>
        </Button>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-400">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => onCreateEvent({
              title: '',
              description: '',
              start: new Date(),
              end: new Date(),
              category: 'meeting',
              priority: 'medium'
            })}
          >
            Create Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            Set Reminder
          </Button>
        </div>
      </div>
    </div>
  )
} 