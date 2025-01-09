import { useState, useEffect, useCallback } from 'react'
import { UserSession } from '@/types/users'
import { CalendarEvent } from '@/types/calendar'
import { calendarService } from '@/lib/supabase/services/calendar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CalendarIcon, Plus, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { CalendarView } from '@/components/calendar/calendar-view'
import { EventDetails } from '@/components/calendar/new/EventDetails'
import { MiniCalendar } from '@/components/calendar/mini-calendar'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { startOfMonth, endOfMonth, addMonths } from 'date-fns'

interface CalendarClientProps {
  session: UserSession
}

export function CalendarClient({ session }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  
  // New simpler filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<{id: string, name: string}[]>([])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Calculate a broader range to ensure we get all needed events
        const start = startOfMonth(selectedDate)
        const end = endOfMonth(addMonths(selectedDate, 2)) // Fetch 3 months worth
        
        const events = await calendarService.getEvents(start, end, session)
        console.log('Raw events from service:', events)
        setEvents(events)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      }
    }
    fetchEvents()

    // Add event listeners for calendar refresh
    const handleRefresh = () => {
      console.log('Calendar refresh event received')
      fetchEvents()
    }

    window.addEventListener('calendar:refresh', handleRefresh)
    window.addEventListener('refresh', handleRefresh)

    return () => {
      window.removeEventListener('calendar:refresh', handleRefresh)
      window.removeEventListener('refresh', handleRefresh)
    }
  }, [session, selectedDate])

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
        toast.error('Failed to load filters')
      }
    }
    fetchFilters()
  }, [session])

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // Create a clean copy of the event data
    const cleanEvent = {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      description: event.description || '',
      category: event.category || 'default',
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined
    } as CalendarEvent

    setSelectedEvent(cleanEvent)
    setShowEventDetails(true)
  }, [])

  const handleEventDelete = useCallback(async (event: CalendarEvent) => {
    try {
      await calendarService.deleteEvent(session, event.id)
      setEvents(prevEvents => prevEvents.filter(e => e.id !== event.id))
      toast.success('Event deleted successfully')
      setShowEventDetails(false)
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
      setShowEventDetails(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  // New simpler filtering logic
  const filteredEvents = events.filter(event => {
    // If no filters are selected, show all events
    if (!selectedDepartment && !selectedUser && !searchQuery) {
      return true
    }

    // Apply department filter
    if (selectedDepartment && event.department !== selectedDepartment) {
      return false
    }

    // Apply user filter
    if (selectedUser && event.user_id !== selectedUser) {
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
    setSelectedDepartment('')
    setSelectedUser('')
    setSearchQuery('')
  }

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
              onClick={() => setShowEventDetails(true)} 
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
            
            {/* New Simplified Filters */}
            <div className="bg-[#0F1629] rounded-lg border border-white/[0.08] shadow-xl p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Filters</h3>
                {(selectedDepartment || selectedUser || searchQuery) && (
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
                    <SelectItem value="">All Departments</SelectItem>
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
                    <SelectItem value="">All Users</SelectItem>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Event Details Split View */}
      <AnimatePresence>
        {showEventDetails && selectedEvent && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] bg-[#0F1629] border-l border-white/[0.08] shadow-2xl"
          >
            <EventDetails
              event={selectedEvent}
              onClose={() => {
                setShowEventDetails(false)
                setSelectedEvent(null)
              }}
              onEdit={() => {
                // Handle edit
              }}
              onDelete={() => handleEventDelete(selectedEvent)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 