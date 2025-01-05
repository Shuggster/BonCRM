"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { CalendarEvent, RecurringEventDeleteOption, RecurrenceRule } from '@/types/calendar'
import { MonthView } from '@/components/calendar/new/views/month-view'
import { WeekView } from '@/components/calendar/new/views/week-view'
import { DayView } from '@/components/calendar/new/views/day-view'
import { EventModal } from '@/components/calendar/new/EventModal'
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
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Calendar, Trash2, Clock, Plus, LayoutGrid } from 'lucide-react'
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
import { CalendarFilterHeader } from '@/components/calendar/new/CalendarFilterHeader'
import { DateRangeType } from '@/components/calendar/new/DateRangeFilter'
import { PriorityType } from '@/components/calendar/new/PriorityFilter'
import { StatusType } from '@/components/calendar/new/StatusFilter'
import { PageHeader } from '@/components/ui/page-header'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FilteredEventsUpperCard } from '@/components/calendar/new/FilteredEventsUpperCard'
import { FilteredEventsLowerCard } from '@/components/calendar/new/FilteredEventsLowerCard'
import { useSession } from 'next-auth/react'
import { toUserSession } from '@/types/session'
import { EditEventForm } from '@/components/calendar/new/EditEventForm'

interface DateRange {
  start: Date
  end: Date
}

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
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType | null>(null)
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<PriorityType | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const handleEventCreateRef = useRef<(dateOrEvent: Date | Omit<CalendarEvent, 'id'>) => void>()

  const showCalendarOverview = useCallback(() => {
    setContentAndShow(
      <CalendarOverviewUpperCard 
        events={events}
        onViewEvents={handleViewEvents}
      />,
      <CalendarOverviewLowerCard 
        events={events}
        onCreateEvent={() => handleEventCreateRef.current?.(currentDate)}
        onViewUpcoming={() => {
          const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
          handleViewEvents(upcomingEvents, "Upcoming Events")
        }}
        onJumpToday={() => setCurrentDate(new Date())}
      />,
      'calendar-overview'
    )
  }, [events, currentDate, setContentAndShow])

  const handleViewEvents = useCallback((filteredEvents: CalendarEvent[], title: string) => {
    setContentAndShow(
      <FilteredEventsUpperCard 
        events={filteredEvents} 
        title={title} 
        onCreateEvent={handleEventCreateRef.current!}
      />,
      <FilteredEventsLowerCard 
        events={filteredEvents} 
        title={title}
      />,
      'filtered-events'
    )
  }, [setContentAndShow])

  const handleEventSubmit = useCallback(async (eventData: Partial<CalendarEvent>) => {
    try {
      setError(null)
      if (!eventData.title || !eventData.start || !eventData.end) {
        return
      }

      if (selectedEvent) {
        // Extract the base ID for recurring event instances
        const eventId = selectedEvent.id.split('_')[0]
        await calendarService.updateEvent({
          ...selectedEvent,
          ...eventData,
          id: eventId // Use the base ID for the update
        }, session)
      } else {
        const newEvent: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
          title: eventData.title,
          description: eventData.description || '',
          start: eventData.start,
          end: eventData.end,
          category: (eventData.category || 'default') as EventCategory,
          status: eventData.status || 'scheduled',
          priority: eventData.priority || 'medium',
          user_id: session.user.id,
          assigned_to: eventData.assigned_to || session.user.id,
          assigned_to_type: eventData.assigned_to_type || 'user',
          department: eventData.department || session.user.department,
          location: eventData.location || '',
          recurrence: null,
          type: eventData.type || 'meeting'
        }
        await calendarService.createEvent(newEvent, session)
      }

      // Refresh events
      const start = startOfMonth(subMonths(currentDate, 1))
      const end = endOfMonth(addMonths(currentDate, 1))
      const updatedEvents = await calendarService.getEvents(start, end, session)
      setEvents(updatedEvents)
      setIsModalOpen(false)
      
      // Reset back to calendar overview
      showCalendarOverview()
    } catch (err) {
      console.error('Failed to save event:', err)
      setError(err instanceof Error ? err.message : 'Failed to save event')
    }
  }, [currentDate, selectedEvent, showCalendarOverview, session])

  const handleEventCreate = useCallback((date: Date) => {
    if (!session) return

    const defaultEvent: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
      title: '',
      description: '',
      start: date,
      end: new Date(date.getTime() + 30 * 60000), // 30 minutes later
      category: 'meeting',
      status: 'scheduled',
      priority: 'medium',
      user_id: session.user.id,
      assigned_to: session.user.id,
      assigned_to_type: 'user',
      department: session.user.department,
      location: '',
      recurrence: null,
      type: 'meeting'
    }

    const { upperCard, lowerCard } = CreateEventForm.createCards(
      handleEventSubmit,
      showCalendarOverview,
      defaultEvent
    )

    setContentAndShow(
      upperCard,
      lowerCard,
      'create-event'
    )
  }, [session, setContentAndShow, showCalendarOverview, handleEventSubmit])

  // Store the current handleEventCreate in the ref
  useEffect(() => {
    handleEventCreateRef.current = (dateOrEvent) => {
      if (dateOrEvent instanceof Date) {
        handleEventCreate(dateOrEvent)
      } else {
        handleEventCreate(dateOrEvent.start)
      }
    }
  }, [handleEventCreate])

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
        onViewEvents={handleViewEvents}
      />,
      <CalendarOverviewLowerCard 
        events={events}
        onCreateEvent={() => handleEventCreate(currentDate)}
        onViewUpcoming={() => {
          const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
          handleViewEvents(upcomingEvents, "Upcoming Events")
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
    setContentAndShow(
      <EventDetails 
        event={event}
        onClose={() => showCalendarOverview()}
        onEdit={() => {
          const { upperCard, lowerCard } = EditEventForm.createCards(
            event,
            handleEventSubmit,
            showCalendarOverview
          )
          setContentAndShow(upperCard, lowerCard, 'edit-event')
        }}
        onDelete={() => handleEventDelete(event)}
      />,
      null,
      'event-details'
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
        const newEvent: Omit<CalendarEvent, 'id'> = {
          title: eventData.title,
          description: eventData.description || '',
          start: eventData.start,
          end: eventData.end,
          category: (eventData.category || 'default') as EventCategory,
          status: eventData.status || 'scheduled',
          priority: eventData.priority || 'medium',
          user_id: session.user.id,
          assigned_to: session.user.id,
          assigned_to_type: 'user',
          department: session.user.department,
          location: '',
          recurrence: null,
          type: 'meeting'
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
    if (event.recurrence || event.id.includes('_')) {
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

  useEffect(() => {
    let filtered = [...events]

    // Apply date range filter
    if (selectedDateRange) {
      let startDate: Date | null = null
      let endDate: Date | null = null

      switch (selectedDateRange) {
        case 'today':
          startDate = startOfDay(new Date())
          endDate = endOfDay(new Date())
          break
        case 'thisWeek':
          startDate = startOfWeek(new Date())
          endDate = endOfWeek(new Date())
          break
        case 'thisMonth':
          startDate = startOfMonth(new Date())
          endDate = endOfMonth(new Date())
          break
        case 'custom':
          if (customDateRange) {
            startDate = startOfDay(customDateRange.start)
            endDate = endOfDay(customDateRange.end)
          }
          break
      }

      if (startDate && endDate) {
        filtered = filtered.filter(event => {
          const eventStart = new Date(event.start)
          return eventStart >= startDate! && eventStart <= endDate!
        })
      }
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(event => event.status === selectedStatus)
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter(event => event.priority === selectedPriority)
    }

    // Apply assignee filter
    if (selectedAssignee) {
      filtered = filtered.filter(event => event.assigned_to === selectedAssignee)
    }

    setFilteredEvents(filtered)
  }, [events, selectedDateRange, customDateRange, selectedStatus, selectedPriority, selectedAssignee])

  const renderView = () => {
    const commonProps = {
      events: filteredEvents,
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
      className="flex flex-col h-full max-w-full bg-black"
    >
      {/* Top Header with Title */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex-1">
          <PageHeader 
            heading="Calendar"
            description="Manage your schedule and appointments"
            icon={<CalendarIcon className="h-6 w-6" />}
          />
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => handleEventCreate(new Date())}
            className={cn(
              "flex items-center gap-2 px-4 py-2 h-10",
              "bg-[#1a1a1a] hover:bg-[#222] text-white",
              "border border-white/[0.08] rounded-lg",
              "transition-all duration-200"
            )}
          >
            <span>Create Event</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="border-b border-white/[0.08] bg-black">
        <div className="flex items-center justify-between">
          <CalendarFilterHeader
            dateRange={selectedDateRange}
            customDateRange={customDateRange}
            status={selectedStatus}
            priority={selectedPriority}
            assignee={selectedAssignee}
            onDateRangeChange={setSelectedDateRange}
            onCustomDateRangeChange={setCustomDateRange}
            onStatusChange={setSelectedStatus}
            onPriorityChange={setSelectedPriority}
            onAssigneeChange={setSelectedAssignee}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setContentAndShow(
                      <CalendarOverviewUpperCard 
                        events={events}
                        onViewEvents={handleViewEvents}
                      />,
                      <CalendarOverviewLowerCard 
                        events={events}
                        onCreateEvent={() => handleEventCreate(currentDate)}
                        onViewUpcoming={() => {
                          const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
                          handleViewEvents(upcomingEvents, "Upcoming Events")
                        }}
                        onJumpToday={() => setCurrentDate(new Date())}
                      />,
                      'calendar-overview'
                    )
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3",
                    "text-zinc-400 hover:text-zinc-300",
                    "border border-white/[0.08] rounded-lg"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Events Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-black">
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1 rounded-lg p-1">
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
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Calendar View */}
      <div className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
        {renderView()}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedEvent}
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