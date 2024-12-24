"use client"

import { Calendar as CalendarIcon, Plus, X } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CalendarView } from "@/components/calendar/calendar-view"
import { EventModal } from "@/components/calendar/event-modal"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CalendarEvent } from "@/types/calendar"
import { startOfMonth, endOfMonth } from "date-fns"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { calendarService } from '@/lib/supabase/services/calendar'
import { UserSession } from "@/types/users"
import { Session } from '@supabase/supabase-js'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface CalendarClientProps {
  session: UserSession
}

export function CalendarClient({ session }: CalendarClientProps) {
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewStart, setViewStart] = useState(startOfMonth(currentDate))
  const [viewEnd, setViewEnd] = useState(endOfMonth(currentDate))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  // Constants for "All" values
  const ALL_DEPARTMENTS = "all_departments"
  const ALL_USERS = "all_users"

  // New filter state with proper types
  const [selectedDepartment, setSelectedDepartment] = useState<string>(ALL_DEPARTMENTS)
  const [selectedUser, setSelectedUser] = useState<string>(ALL_USERS)
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
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

  // Fetch available departments and users
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const departments = await calendarService.getDepartments(session)
        setAvailableDepartments(departments)
        
        const users = await calendarService.getUsers(session)
        setAvailableUsers(users)
      } catch (error) {
        console.error('Error fetching filters:', error)
        setError('Failed to load filters')
      }
    }
    fetchFilters()
  }, [session])

  const filteredEvents = events.filter(event => {
    // If no filters are selected, show all events
    if (selectedDepartment === ALL_DEPARTMENTS && selectedUser === ALL_USERS && !searchQuery) {
      return true
    }

    // Apply department filter
    if (selectedDepartment !== ALL_DEPARTMENTS && event.department !== selectedDepartment) {
      return false
    }

    // Apply user filter
    if (selectedUser !== ALL_USERS && event.user_id !== selectedUser) {
      return false
    }

    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search)
      )
    }

    return true
  })

  const resetFilters = () => {
    setSelectedDepartment(ALL_DEPARTMENTS)
    setSelectedUser(ALL_USERS)
    setSearchQuery('')
  }

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
        session,
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
      const newEvent = await calendarService.createEvent(session, {
        title: eventData.title || 'New Event',
        description: eventData.description || '',
        start: eventData.start!,
        end: eventData.end!,
        category: eventData.category || 'default',
        recurrence: eventData.recurrence,
        assigned_to: eventData.assigned_to,
        assigned_to_type: eventData.assigned_to_type,
        department: eventData.department,
        user_id: session.user.id
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
        session,
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
          session,
          selectedEvent.id,
          { ...selectedEvent, ...eventData }
        );
        setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
      } else {
        const newEvent = await calendarService.createEvent(session, {
          title: eventData.title || 'New Event',
          description: eventData.description || '',
          start: eventData.start!,
          end: eventData.end!,
          category: eventData.category || 'default',
          recurrence: eventData.recurrence,
          assigned_to: eventData.assigned_to,
          assigned_to_type: eventData.assigned_to_type,
          department: eventData.department,
          user_id: session.user.id
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

  const handleEventDelete = async (event: CalendarEvent) => {
    try {
      setError(null);
      await calendarService.deleteEvent(session, event.id);
      setEvents(events.filter(e => e.id !== event.id));
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete event');
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
                          rounded-lg border border-white/[0.08] shadow-xl p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Filters</h3>
                {(selectedDepartment !== ALL_DEPARTMENTS || selectedUser !== ALL_USERS || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 px-2 text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full"
                />

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_DEPARTMENTS}>All Departments</SelectItem>
                    {availableDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_USERS}>All Users</SelectItem>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                session={session}
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
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        event={selectedEvent}
        session={session}
        initialData={selectedEvent ? {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          category: selectedEvent.category || 'default',
          start: new Date(selectedEvent.start),
          end: new Date(selectedEvent.end),
          recurrence: selectedEvent.recurrence,
          assigned_to: selectedEvent.assigned_to,
          assigned_to_type: selectedEvent.assigned_to_type,
          department: selectedEvent.department
        } : undefined}
      />
    </>
  )
} 