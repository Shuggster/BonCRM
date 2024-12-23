import { useState, useEffect, useCallback } from 'react'
import { UserSession } from '@/types/users'
import { CalendarEvent } from '@/types/calendar'
import { calendarService } from '@/lib/supabase/services/calendar'
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
import { DepartmentFilter } from '@/components/calendar/department-filter'
import { AssignmentFilter } from '@/components/calendar/assignment-filter'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { addMinutes } from 'date-fns'

interface CalendarClientProps {
  session: UserSession
}

export function CalendarClient({ session }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(EVENT_CATEGORIES))
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await calendarService.getEvents(session)
        setEvents(events)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      }
    }
    fetchEvents()
  }, [session])

  // Fetch available departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await calendarService.getDepartments(session)
        setAvailableDepartments(departments)
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast.error('Failed to load departments')
      }
    }
    fetchDepartments()
  }, [session])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('Event clicked:', {
      event,
      eventId: event.id,
      eventTitle: event.title,
      isRecurring: event.isRecurring,
      originalEventId: event.originalEventId
    })

    // Create a clean copy of the event data
    const cleanEvent = {
      ...event,
      id: event.originalEventId || event.id, // Use the original event ID if this is a recurring instance
      start: new Date(event.start),
      end: new Date(event.end),
      description: event.description || '',
      category: event.category || 'default',
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined
    } as CalendarEvent

    console.log('Setting selected event:', cleanEvent)
    setSelectedEvent(cleanEvent)
    setShowEventModal(true)
  }, [])

  const handleEventDelete = useCallback(async (event: CalendarEvent) => {
    try {
      console.log('Deleting event:', event)
      // If this is a recurring instance, we need to delete the original event
      const eventId = event.originalEventId || event.id
      await calendarService.deleteEvent(session, eventId)
      
      // Remove the event from the local state
      setEvents(prevEvents => prevEvents.filter(e => 
        e.id !== eventId && e.originalEventId !== eventId
      ))
      
      toast.success('Event deleted successfully')
      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }, [session])

  const handleEventDrop = async (event: CalendarEvent, newStart: Date) => {
    try {
      const duration = event.end.getTime() - event.start.getTime()
      const newEnd = new Date(newStart.getTime() + duration)
      
      const updatedEvent: CalendarEvent = {
        ...event,
        start: newStart,
        end: newEnd,
        assigned_to: event.assigned_to || undefined,
        assigned_to_type: event.assigned_to_type || undefined,
        department: event.department || undefined
      }
      
      await calendarService.updateEvent(session, event.id, updatedEvent)
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e))
      toast.success('Event updated successfully')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleEventCreate = async (event: Partial<CalendarEvent>) => {
    try {
      const newEvent = await calendarService.createEvent(session, {
        ...event,
        user_id: session.user.id,
        assigned_to: event.assigned_to || undefined,
        assigned_to_type: event.assigned_to_type || undefined,
        department: event.department || undefined
      } as Omit<CalendarEvent, 'id'>)
      setEvents([...events, newEvent])
      toast.success('Event created successfully')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    }
  }

  const handleEventResize = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      const updatedEvent: CalendarEvent = {
        ...event,
        start: newStart,
        end: newEnd,
        assigned_to: event.assigned_to || undefined,
        assigned_to_type: event.assigned_to_type || undefined,
        department: event.department || undefined
      }
      
      await calendarService.updateEvent(session, event.id, updatedEvent)
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e))
      toast.success('Event updated successfully')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await calendarService.updateEvent(session, selectedEvent.id, {
          ...selectedEvent,
          ...eventData,
          category: eventData.category || 'default'
        })
        // Update the events array with the complete updated event
        setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e))
        toast.success('Event updated successfully')
      } else {
        // Create new event
        const newEvent = await calendarService.createEvent(session, {
          ...eventData,
          user_id: session.user.id,
          category: eventData.category || 'default'
        } as Omit<CalendarEvent, 'id'>)
        setEvents([...events, newEvent])
        toast.success('Event created successfully')
      }
      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  // Filter events based on selected categories, departments, and assignments
  const filteredEvents = events.filter(event => {
    // If no categories selected, show all categories
    const categoryMatch = selectedCategories.length === 0 || 
      (event.category && selectedCategories.includes(event.category)) ||
      (!event.category && selectedCategories.includes('default'))
    
    // If no departments selected, show all departments
    const departmentMatch = selectedDepartments.length === 0 || 
      (event.department && selectedDepartments.includes(event.department))
    
    // If no assignments selected, show all events
    const assignmentMatch = selectedAssignments.length === 0 ||
      (event.assigned_to && selectedAssignments.includes(event.assigned_to))

    return categoryMatch && departmentMatch && assignmentMatch
  })

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
          <aside className="col-span-12 md:col-span-3 space-y-6">
            {/* Mini Calendar */}
            <div className="bg-[#0F1629] rounded-lg border border-white/[0.08] shadow-xl p-4">
              <MiniCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateChange}
              />
            </div>
            
            {/* Filters */}
            <div className="bg-[#0F1629] rounded-lg border border-white/[0.08] shadow-xl p-4 space-y-6">
              <EventSearch 
                value={searchQuery} 
                onChange={setSearchQuery}
                events={events}
              />
              <CategoryFilter 
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
              <DepartmentFilter
                selectedDepartments={selectedDepartments}
                onChange={setSelectedDepartments}
                session={session}
                departments={availableDepartments}
              />
              <AssignmentFilter
                selectedAssignments={selectedAssignments}
                onChange={setSelectedAssignments}
                session={session}
              />
            </div>
          </aside>

          {/* Calendar */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-[#0F1629] rounded-lg border border-white/[0.08] shadow-xl overflow-hidden p-4">
              <CalendarView 
                events={filteredEvents} 
                onEventClick={handleEventClick}
                onEventDrop={handleEventDrop}
                onEventCreate={handleEventCreate}
                onEventResize={handleEventResize}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                session={session}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          console.log('Closing modal, clearing selected event')
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
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
    </div>
  )
} 