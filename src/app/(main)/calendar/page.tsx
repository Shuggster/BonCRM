"use client"

import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CalendarView } from "@/components/calendar/calendar-view"
import { CategoryFilter } from "@/components/calendar/category-filter"
import { EventSearch } from "@/components/calendar/event-search"
import { EventModal } from "@/components/calendar/event-modal"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CalendarEvent } from "@/types/calendar"
import { startOfMonth, endOfMonth, addDays, addWeeks, addMonths, addYears } from "date-fns"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { calendarService } from '@/lib/supabase/services/calendar'

function generateRecurringEvents(event: CalendarEvent, viewStart: Date, viewEnd: Date): CalendarEvent[] {
  if (!event.recurrence) return [event]

  const events: CalendarEvent[] = []
  let currentDate = new Date(event.start)
  const endDate = event.recurrence.endDate || new Date(viewEnd)

  while (currentDate <= endDate && currentDate <= viewEnd) {
    const eventDuration = event.end.getTime() - event.start.getTime()
    
    events.push({
      ...event,
      id: `${event.id}-${currentDate.getTime()}`,
      start: new Date(currentDate),
      end: new Date(currentDate.getTime() + eventDuration),
      isRecurrence: true
    })

    // Calculate next occurrence
    switch (event.recurrence.frequency) {
      case 'daily':
        currentDate = addDays(currentDate, event.recurrence.interval || 1)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, event.recurrence.interval || 1)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, event.recurrence.interval || 1)
        break
      case 'yearly':
        currentDate = addYears(currentDate, event.recurrence.interval || 1)
        break
    }
  }

  return events
}

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewStart, setViewStart] = useState(startOfMonth(currentDate))
  const [viewEnd, setViewEnd] = useState(endOfMonth(currentDate))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError(null)
        const events = await calendarService.getEvents()
        console.log('Loaded events:', events)
        setEvents(events)
      } catch (error) {
        console.error('Failed to load events:', error)
        setError(error instanceof Error ? error.message : 'Failed to load events')
      }
    }
    loadEvents()
  }, [])

  const handleEventClick = (event: CalendarEvent) => {
    // If it's a recurring event instance, find the original event
    const originalEvent = event.isRecurrence 
      ? events.find(e => e.id === event.id.split('-')[0])
      : events.find(e => e.id === event.id)

    setSelectedEvent(originalEvent || event)
    setShowEventModal(true)
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (selectedEvent) {
        // Update existing event
        await calendarService.updateEvent({
          ...selectedEvent,
          ...eventData,
          start: eventData.start!,
          end: eventData.end!
        })
      } else {
        // Create new event
        await calendarService.createEvent({
          title: eventData.title || 'New Event',
          description: eventData.description || '',
          start: eventData.start!,
          end: eventData.end!,
          category: eventData.category || 'default',
          recurrence: eventData.recurrence
        })
      }

      // Reload events
      const updatedEvents = await calendarService.getEvents()
      setEvents(updatedEvents)
      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleViewChange = (start: Date, end: Date) => {
    setViewStart(start)
    setViewEnd(end)
  }

  const handleEventDrop = (event: CalendarEvent, newStart: Date) => {
    const duration = event.end.getTime() - event.start.getTime()
    const newEnd = new Date(newStart.getTime() + duration)

    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd
    }

    setEvents(events.map(e => 
      e.id === event.id ? updatedEvent : e
    ))
  }

  const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      title: eventData.title || 'New Event',
      description: eventData.description || '',
      start: eventData.start!,
      end: eventData.end!,
      category: eventData.category || 'default'
    }

    setEvents([...events, newEvent])
  }

  const handleEventResize = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    setEvents(events.map(e => 
      e.id === event.id 
        ? { ...e, start: newStart, end: newEnd }
        : e
    ))
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const filteredEvents = events.flatMap(event => 
    generateRecurringEvents(event, viewStart, viewEnd)
  ).filter(event => {
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(event.category || 'default')
    
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase())

    console.log('Filtered Events:', { 
      total: events.length,
      filtered: filteredEvents.length,
      categories: selectedCategories,
      search: searchQuery
    })

    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full bg-[#030711]">
      <div className="container mx-auto max-w-7xl p-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <PageHeader 
              heading="Calendar"
              description="Manage your schedule and appointments"
              icon={<CalendarIcon className="h-6 w-6" />}
            />
          </div>
          <div className="flex-shrink-0 ml-4">
            <Button onClick={() => setShowEventModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

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
                          rounded-lg border border-white/[0.08] shadow-xl overflow-hidden">
              <CalendarView 
                events={filteredEvents} 
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                onEventCreate={handleEventCreate}
                onEventResize={handleEventResize}
                onViewChange={handleViewChange}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
        initialData={{
          title: selectedEvent?.title || '',
          description: selectedEvent?.description || '',
          category: selectedEvent?.category || 'default',
          start: selectedEvent?.start || new Date(),
          end: selectedEvent?.end || new Date(),
          recurrence: selectedEvent?.recurrence
        }}
      />
    </div>
  )
}
