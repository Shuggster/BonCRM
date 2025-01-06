'use client'

import { Button } from '@/components/ui/button'
import { CalendarEvent } from '@/types/calendar'
import { EventCategory } from '@/lib/constants/categories'
import { format } from 'date-fns'
import { exportEventsToCSV } from '@/lib/utils/exportEvents'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { FilteredEventsLowerCard } from './FilteredEventsLowerCard'

interface FilteredEventsUpperCardProps {
  events: CalendarEvent[]
  title: string
  onCreateEvent: (event: Omit<CalendarEvent, 'id'>) => void
}

export function FilteredEventsUpperCard({ events, title, onCreateEvent }: FilteredEventsUpperCardProps) {
  const { setContentAndShow } = useSplitViewStore()

  const handleExport = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    exportEventsToCSV(events, filename)
  }

  const handleViewHighPriority = () => {
    const highPriorityEvents = events.filter(e => e.priority === 'high')
    setContentAndShow(
      <FilteredEventsUpperCard 
        events={highPriorityEvents} 
        title="High Priority Events" 
        onCreateEvent={onCreateEvent}
      />,
      <FilteredEventsLowerCard events={highPriorityEvents} title="High Priority Events" />,
      'filtered-events'
    )
  }

  const handleViewCategories = () => {
    // Group events by category
    const categories = Array.from(new Set(events.map(e => e.category))) as EventCategory[]
    const categoryEvents: CalendarEvent[] = categories.map(category => ({
      id: `category-${category}`,
      title: `${category} (${events.filter(e => e.category === category).length})`,
      description: `Events in ${category} category`,
      start: new Date(),
      end: new Date(),
      category: category,
      priority: 'medium'
    }))

    setContentAndShow(
      <FilteredEventsUpperCard 
        events={categoryEvents} 
        title="Events by Category" 
        onCreateEvent={onCreateEvent}
      />,
      <FilteredEventsLowerCard events={categoryEvents} title="Events by Category" />,
      'filtered-events'
    )
  }

  return (
    <div className="h-full rounded-t-2xl bg-[#111111] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
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
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent group"
          onClick={handleViewHighPriority}
        >
          <div className="w-full p-4 rounded-lg bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-colors">
            <div className="text-sm text-zinc-400">High Priority</div>
            <div className="text-xl font-semibold text-white mt-1">
              {events.filter(e => e.priority === 'high').length}
            </div>
          </div>
        </Button>
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent group"
          onClick={handleViewCategories}
        >
          <div className="w-full p-4 rounded-lg bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-colors">
            <div className="text-sm text-zinc-400">Categories</div>
            <div className="text-xl font-semibold text-white mt-1">
              {new Set(events.map(e => e.category)).size}
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