"use client"

import { useState, useEffect } from 'react'
import { CalendarEvent, RecurringEventDeleteOption } from '@/types/calendar'
import { MonthView } from '@/components/calendar/new/views/month-view'
import { WeekView } from '@/components/calendar/new/views/week-view'
import { DayView } from '@/components/calendar/new/views/day-view'
import { EventModal } from '@/components/calendar/event-modal'
import { UserSession } from '@/types/session'
import { calendarService } from '@/lib/supabase/services/calendar'
import { motion } from 'framer-motion'
import { 
  addDays, 
  addMonths, 
  addWeeks, 
  subDays, 
  subMonths, 
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
  isToday
} from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Calendar, Trash2, Clock } from 'lucide-react'
import { EventCategory } from '@/lib/constants/categories'
import { Button } from '@/components/ui/button'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { splitContentVariants, pageVariants } from '@/lib/animations'
import { CalendarOverviewUpperCard } from '@/components/calendar/new/CalendarOverviewUpperCard'
import { CalendarOverviewLowerCard } from '@/components/calendar/new/CalendarOverviewLowerCard'
import { CreateEventForm } from '@/components/calendar/new/CreateEventForm'
import { EventPriority } from '@/types/calendar'
import { DeleteRecurringEventDialog } from '@/components/calendar/new/DeleteRecurringEventDialog'
import { EventDetails } from '@/components/calendar/new/EventDetails'

// Use standard page transition config
const pageTransitionConfig = pageVariants

type ViewType = 'month' | 'week' | 'day'

interface CalendarClientProps {
  session: UserSession
}

export default function CalendarClient({ session }: CalendarClientProps) {
  const { setContentAndShow } = useSplitViewStore()
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Calculate view range based on current view type
        let start: Date, end: Date
        switch (viewType) {
          case 'month':
            start = startOfMonth(subMonths(currentDate, 1))
            end = endOfMonth(addMonths(currentDate, 1))
            break
          case 'week':
            start = startOfWeek(currentDate)
            end = endOfWeek(currentDate)
            break
          case 'day':
            start = startOfDay(currentDate)
            end = endOfDay(currentDate)
            break
        }

        const fetchedEvents = await calendarService.getEvents(start, end, session)
        setEvents(fetchedEvents)
      } catch (err) {
        console.error('Failed to load events:', err)
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [currentDate, viewType, session])

  useEffect(() => {
    // Set initial split view content
    setContentAndShow(
      <CalendarOverviewUpperCard 
        events={events}
        onViewEvents={(filteredEvents, title) => {
          // Handle viewing filtered events
          console.log('Viewing filtered events:', title, filteredEvents)
        }}
      />,
      <CalendarOverviewLowerCard 
        events={events}
        onCreateEvent={() => {
          // Use the currently selected date from the calendar
          const startDate = new Date(currentDate)
          // Set time to current time
          startDate.setHours(new Date().getHours())
          startDate.setMinutes(new Date().getMinutes())
          handleEventCreate(startDate)
        }}
        onViewUpcoming={() => {
          const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
          console.log('Viewing upcoming events:', upcomingEvents)
        }}
        onJumpToday={() => setCurrentDate(new Date())}
      />,
      'calendar-overview'
    )
  }, [events, setContentAndShow])

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setContentAndShow(
      <motion.div
        variants={splitContentVariants.top}
        initial="initial"
        animate="animate"
        className="bg-[#111111] rounded-t-xl p-6"
      >
        {/* Top Card - Main Event Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{event.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={() => {
                // Reset back to calendar overview
                setContentAndShow(
                  <CalendarOverviewUpperCard 
                    events={events}
                    onViewEvents={(filteredEvents, title) => {
                      console.log('Viewing filtered events:', title, filteredEvents)
                    }}
                  />,
                  <CalendarOverviewLowerCard 
                    events={events}
                    onCreateEvent={() => handleEventCreate(currentDate)}
                    onViewUpcoming={() => {
                      const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
                      console.log('Viewing upcoming events:', upcomingEvents)
                    }}
                    onJumpToday={() => setCurrentDate(new Date())}
                  />,
                  'calendar-overview'
                )
              }}
            >
              <span className="text-xl">×</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(event.start), 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
            </span>
          </div>

          {event.category && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 text-sm">
              <span className={cn(
                "w-2 h-2 rounded-full",
                event.category === 'task' && "bg-emerald-500",
                event.category === 'meeting' && "bg-blue-500",
                event.category === 'reminder' && "bg-amber-500",
                event.category === 'deadline' && "bg-red-500"
              )} />
              <span className="text-zinc-200 capitalize">{event.category}</span>
            </div>
          )}
        </div>
      </motion.div>,
      <motion.div
        variants={splitContentVariants.bottom}
        initial="initial"
        animate="animate"
        className="bg-[#111111] rounded-b-xl border-t border-white/[0.08] p-6"
      >
        {/* Bottom Card - Description and Actions */}
        <div className="space-y-6">
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Description</h3>
              <p className="text-sm text-zinc-300">{event.description}</p>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            {event.assigned_to && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-zinc-400">Assigned To</h3>
                <p className="text-sm text-zinc-300">{event.assigned_to}</p>
              </div>
            )}
            {event.location && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-zinc-400">Location</h3>
                <p className="text-sm text-zinc-300">{event.location}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Edit Event
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 justify-center bg-black border-white/[0.08] hover:bg-white/5 text-red-400 hover:text-red-300"
              onClick={() => handleEventDelete(event)}
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Event
              </span>
            </Button>
          </div>
        </div>
      </motion.div>,
      `event-${event.id}`
    )
  }

  const handleEventDrop = async (event: CalendarEvent, newStart: Date) => {
    try {
      setError(null)
      const duration = event.end.getTime() - event.start.getTime()
      const newEnd = new Date(newStart.getTime() + duration)
      
      await calendarService.updateEvent({
        ...event,
        start: newStart,
        end: newEnd
      }, session)

      // Refresh events
      const start = startOfMonth(subMonths(currentDate, 1))
      const end = endOfMonth(addMonths(currentDate, 1))
      const updatedEvents = await calendarService.getEvents(start, end, session)
      setEvents(updatedEvents)
    } catch (err) {
      console.error('Failed to update event:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event')
    }
  }

  const handleEventResize = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      setError(null)
      await calendarService.updateEvent({
        ...event,
        start: newStart,
        end: newEnd
      }, session)

      // Refresh events
      const start = startOfMonth(subMonths(currentDate, 1))
      const end = endOfMonth(addMonths(currentDate, 1))
      const updatedEvents = await calendarService.getEvents(start, end, session)
      setEvents(updatedEvents)
    } catch (err) {
      console.error('Failed to update event:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event')
    }
  }

  const handleEventCreate = (date: Date) => {
    const defaultEvent: Partial<Omit<CalendarEvent, 'id'>> = {
      title: '',
      description: '',
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hour later
      category: 'meeting' as EventCategory,
      priority: 'medium',
      assigned_to: '',
      assigned_to_type: 'user',
      department: session?.user?.department || '',
      user_id: session?.user?.id || ''
    }

    const handleEventSubmit = async (eventData: Omit<CalendarEvent, 'id'>) => {
      try {
        setError(null)
        
        const newEvent = await calendarService.createEvent({
          ...eventData,
          user_id: session.user.id
        }, session)

        // Refresh events
        const fetchStart = startOfMonth(subMonths(currentDate, 1))
        const fetchEnd = endOfMonth(addMonths(currentDate, 1))
        const updatedEvents = await calendarService.getEvents(fetchStart, fetchEnd, session)
        setEvents(updatedEvents)

        // Reset back to calendar overview
        setContentAndShow(
          <CalendarOverviewUpperCard 
            events={updatedEvents}
            onViewEvents={(filteredEvents, title) => {
              console.log('Viewing filtered events:', title, filteredEvents)
            }}
          />,
          <CalendarOverviewLowerCard 
            events={updatedEvents}
            onCreateEvent={() => handleEventCreate(currentDate)}
            onViewUpcoming={() => {
              const upcomingEvents = updatedEvents.filter(e => new Date(e.start) >= new Date())
              console.log('Viewing upcoming events:', upcomingEvents)
            }}
            onJumpToday={() => setCurrentDate(new Date())}
          />,
          'calendar-overview'
        )
      } catch (err) {
        console.error('Failed to create event:', err)
        setError(err instanceof Error ? err.message : 'Failed to create event')
      }
    }

    const { upperCard, lowerCard } = CreateEventForm.createCards(
      handleEventSubmit,
      () => {
        // Reset back to calendar overview
        setContentAndShow(
          <CalendarOverviewUpperCard 
            events={events}
            onViewEvents={(filteredEvents, title) => {
              console.log('Viewing filtered events:', title, filteredEvents)
            }}
          />,
          <CalendarOverviewLowerCard 
            events={events}
            onCreateEvent={() => handleEventCreate(currentDate)}
            onViewUpcoming={() => {
              const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
              console.log('Viewing upcoming events:', upcomingEvents)
            }}
            onJumpToday={() => setCurrentDate(new Date())}
          />,
          'calendar-overview'
        )
      },
      defaultEvent
    )

    setContentAndShow(
      upperCard,
      lowerCard,
      'create-event'
    )
  }

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      setError(null)
      if (!eventData.title || !eventData.start || !eventData.end) {
        return
      }

      if (selectedEvent) {
        await calendarService.updateEvent({
          ...selectedEvent,
          ...eventData
        }, session)
      } else {
        const newEvent = {
          title: eventData.title,
          description: eventData.description || '',
          start: eventData.start,
          end: eventData.end,
          category: (eventData.category || 'default') as EventCategory,
          user_id: session.user.id
        }
        await calendarService.createEvent(newEvent, session)
      }

      // Refresh events
      const start = startOfMonth(subMonths(currentDate, 1))
      const end = endOfMonth(addMonths(currentDate, 1))
      const updatedEvents = await calendarService.getEvents(start, end, session)
      setEvents(updatedEvents)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save event:', err)
      setError(err instanceof Error ? err.message : 'Failed to save event')
    }
  }

  const refreshEvents = async () => {
    const start = startOfMonth(subMonths(currentDate, 1))
    const end = endOfMonth(addMonths(currentDate, 1))
    const updatedEvents = await calendarService.getEvents(start, end, session)
    setEvents(updatedEvents)
    setIsModalOpen(false)
  }

  const handleEventDelete = async (event: CalendarEvent) => {
    // If it's a recurring event or a recurring instance, show the dialog
    if (event.recurring || event.id.includes('_')) {
      setEventToDelete(event)
      setShowDeleteDialog(true)
      return
    }

    // For non-recurring events, delete directly
    try {
      setError(null)
      await calendarService.deleteEvent(event.id, session)
      await refreshEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }

  const handleDeleteConfirm = async (option: RecurringEventDeleteOption) => {
    if (!eventToDelete) return

    try {
      setError(null)
      await calendarService.deleteEvent(
        eventToDelete.id,
        session,
        option,
        new Date(eventToDelete.start)
      )
      await refreshEvents()
      setShowDeleteDialog(false)
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }

  const renderView = () => {
    const commonProps = {
      events,
      onEventClick: handleEventClick,
      onEventDrop: handleEventDrop,
      currentDate,
      onDateChange: handleDateChange
    }

    switch (viewType) {
      case 'month':
        return <MonthView {...commonProps} />
      case 'week':
        return (
          <WeekView 
            {...commonProps} 
            onEventCreate={handleEventCreate}
            onEventResize={handleEventResize}
          />
        )
      case 'day':
        return (
          <DayView 
            {...commonProps} 
            onEventCreate={handleEventCreate}
            onEventResize={handleEventResize}
          />
        )
    }
  }

  return (
    <motion.div 
      variants={pageTransitionConfig}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full max-w-full"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <motion.div 
        className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#111111] rounded-t-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1 bg-[#111111]/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewType('month')}
              className={cn(
                "text-zinc-400 hover:text-zinc-300",
                viewType === 'month' && "bg-white/5 text-zinc-200"
              )}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewType('week')}
              className={cn(
                "text-zinc-400 hover:text-zinc-300",
                viewType === 'week' && "bg-white/5 text-zinc-200"
              )}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewType('day')}
              className={cn(
                "text-zinc-400 hover:text-zinc-300",
                viewType === 'day' && "bg-white/5 text-zinc-200"
              )}
            >
              Day
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="hover:bg-white/5"
          >
            Today
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                switch (viewType) {
                  case 'month':
                    setCurrentDate(subMonths(currentDate, 1))
                    break
                  case 'week':
                    setCurrentDate(subWeeks(currentDate, 1))
                    break
                  case 'day':
                    setCurrentDate(subDays(currentDate, 1))
                    break
                }
              }}
              className="hover:bg-white/5 gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous {viewType}</span>
            </Button>

            <span className="text-sm font-medium min-w-[120px] text-center text-zinc-200">
              {(() => {
                switch (viewType) {
                  case 'month':
                    return format(currentDate, 'MMMM yyyy')
                  case 'week':
                    const weekStart = startOfWeek(currentDate)
                    const weekEnd = endOfWeek(currentDate)
                    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
                  case 'day':
                    return format(currentDate, 'MMMM d, yyyy')
                  default:
                    return format(currentDate, 'MMMM yyyy')
                }
              })()}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                switch (viewType) {
                  case 'month':
                    setCurrentDate(addMonths(currentDate, 1))
                    break
                  case 'week':
                    setCurrentDate(addWeeks(currentDate, 1))
                    break
                  case 'day':
                    setCurrentDate(addDays(currentDate, 1))
                    break
                }
              }}
              className="hover:bg-white/5 gap-2"
            >
              <span>Next {viewType}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="flex-1 overflow-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        {renderView()}
      </motion.div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        session={session}
      />

      <DeleteRecurringEventDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        eventTitle={eventToDelete?.title || ''}
      />
    </motion.div>
  )
} 