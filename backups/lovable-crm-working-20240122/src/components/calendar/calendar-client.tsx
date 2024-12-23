import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { CalendarEvent } from '@/types/calendar'
import { eventService } from '@/lib/supabase/services/events'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CalendarIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { CalendarView } from '@/components/calendar/calendar-view'
import { EventModal } from '@/components/calendar/event-modal'
import { MiniCalendar } from '@/components/calendar/mini-calendar'
import { EventSearch } from '@/components/calendar/event-search'
import { CategoryFilter } from '@/components/calendar/category-filter'

interface CalendarClientProps {
  session: Session
}

export function CalendarClient({ session }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // ... existing handlers ...

  return (
    <div className="h-full bg-[#030711]">
      <div className="container mx-auto max-w-7xl p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <PageHeader 
              heading="Calendar"
              description="Manage your schedule and appointments"
              icon={<CalendarIcon className="h-6 w-6" />}
            />
          </div>
          <div className="flex-shrink-0">
            <Button 
              onClick={() => setShowEventModal(true)} 
              className={cn(
                "gap-2 px-4 py-2 h-10",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "transition-all duration-200"
              )}
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 space-y-6">
            <div className="bg-[#0F1629]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl p-4">
              <MiniCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateChange}
              />
            </div>
            <div className="bg-[#0F1629]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl p-4 space-y-6">
              <EventSearch 
                value={searchQuery} 
                onChange={setSearchQuery}
                events={events}
              />
              <CategoryFilter 
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-gradient-to-br from-[#0F1629]/50 via-[#0F1629]/30 to-[#030711]/50 
                          backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl overflow-hidden p-4">
              <CalendarView 
                events={events} 
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                onEventCreate={handleEventCreate}
                onEventResize={handleEventResize}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
        session={session}
        initialData={{
          title: selectedEvent?.title || '',
          description: selectedEvent?.description || '',
          category: selectedEvent?.category || 'default',
          start: selectedEvent?.start || new Date(),
          end: selectedEvent?.end || new Date(),
          recurrence: selectedEvent?.recurrence,
          assigned_to: selectedEvent?.assigned_to,
          assigned_to_type: selectedEvent?.assigned_to_type,
          department: selectedEvent?.department
        }}
      />
    </div>
  )
} 