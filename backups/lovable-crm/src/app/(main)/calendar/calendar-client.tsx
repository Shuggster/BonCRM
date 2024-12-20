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
import { Session } from '@supabase/supabase-js'

export function CalendarClient({ session }: { session: any }) {
  // Debug log the session
  console.log('Client session:', session)

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
    // Debug log in effect
    console.log('Loading events with session:', session)
    const loadEvents = async () => {
      try {
        setError(null)
        const events = await calendarService.getEvents(session)
        setEvents(events)
      } catch (error) {
        console.error('Failed to load events:', error)
        setError(error instanceof Error ? error.message : 'Failed to load events')
      }
    }
    loadEvents()
  }, [session])

  const handleEventClick = (event: CalendarEvent) => {
    const originalEvent = event.isRecurrence 
      ? events.find(e => e.id === event.id.split('-')[0])
      : events.find(e => e.id === event.id)

    setSelectedEvent(originalEvent || event)
    setShowEventModal(true)
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (selectedEvent) {
        await calendarService.updateEvent({
          ...selectedEvent,
          ...eventData,
          start: eventData.start!,
          end: eventData.end!
        }, session)
      } else {
        await calendarService.createEvent({
          title: eventData.title || 'New Event',
          description: eventData.description || '',
          start: eventData.start!,
          end: eventData.end!,
          category: eventData.category || 'default',
          recurrence: eventData.recurrence
        }, session)
      }

      const updatedEvents = await calendarService.getEvents(session)
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
                events={events} 
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