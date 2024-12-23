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
import { startOfMonth, endOfMonth } from "date-fns"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { calendarService } from '@/lib/supabase/services/calendar'
import { UserSession } from "@/types/session"
import { Session } from '@supabase/supabase-js'

interface CalendarClientProps {
  session: UserSession
}

function isValidSession(session: any): session is UserSession {
  return session && session.user && typeof session.user.id === 'string';
}

function toSupabaseSession(nextAuthSession: any): Session {
  return {
    access_token: '',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: '',
    user: {
      id: nextAuthSession.user.id,
      email: nextAuthSession.user.email,
      role: nextAuthSession.user.role,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: '',
    }
  }
}

export function CalendarClient({ session }: CalendarClientProps) {
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const supabaseSession = toSupabaseSession(session)

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
        const events = await calendarService.getEvents(supabaseSession)
        setEvents(events)
      } catch (error) {
        console.error('Failed to load events:', error)
        setError(error instanceof Error ? error.message : 'Failed to load events')
      }
    }
    loadEvents()
  }, [session])

  const filteredEvents = events.filter(event => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(event.category || 'default');
    const searchMatch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventDrop = async (event: CalendarEvent, newStart: Date) => {
    try {
      setError(null);
      const duration = event.end.getTime() - event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      
      const updatedEvent = await calendarService.updateEvent(
        supabaseSession,
        event.id,
        { ...event, start: newStart, end: newEnd }
      );
      
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    } catch (error) {
      console.error('Failed to update event:', error);
      setError(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  const handleEventCreate = async (eventData: Partial<CalendarEvent>) => {
    try {
      setError(null);
      const newEvent = await calendarService.createEvent(supabaseSession, {
        title: eventData.title || 'New Event',
        description: eventData.description || '',
        start: eventData.start!,
        end: eventData.end!,
        category: eventData.category || 'default',
        recurrence: eventData.recurrence,
        assigned_to: eventData.assigned_to,
        assigned_to_type: eventData.assigned_to_type,
        department: eventData.department
      });
      setEvents([...events, newEvent]);
      setShowEventModal(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
    }
  };

  const handleEventResize = async (event: CalendarEvent, newEnd: Date) => {
    try {
      setError(null);
      const updatedEvent = await calendarService.updateEvent(
        supabaseSession,
        event.id,
        { ...event, end: newEnd }
      );
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    } catch (error) {
      console.error('Failed to update event:', error);
      setError(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      setError(null);
      if (selectedEvent) {
        const updatedEvent = await calendarService.updateEvent(
          supabaseSession,
          selectedEvent.id,
          { ...selectedEvent, ...eventData }
        );
        setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      } else {
        const newEvent = await calendarService.createEvent(supabaseSession, {
          title: eventData.title || 'New Event',
          description: eventData.description || '',
          start: eventData.start!,
          end: eventData.end!,
          category: eventData.category || 'default',
          recurrence: eventData.recurrence,
          assigned_to: eventData.assigned_to,
          assigned_to_type: eventData.assigned_to_type,
          department: eventData.department
        });
        setEvents([...events, newEvent]);
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      setError(error instanceof Error ? error.message : 'Failed to save event');
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

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
            <div className="bg-[#0F1629]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0F1629]/50 
                          rounded-lg border border-white/[0.08] shadow-xl">
              <CalendarView
                events={filteredEvents}
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                onEventCreate={handleEventCreate}
                onEventResize={handleEventResize}
                onDateChange={handleDateChange}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>

        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          event={selectedEvent}
          session={supabaseSession}
        />
      </div>
    </>
  );
} 