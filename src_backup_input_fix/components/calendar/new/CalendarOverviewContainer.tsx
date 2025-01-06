'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { CalendarOverviewUpperCard } from './CalendarOverviewUpperCard'
import { CalendarOverviewLowerCard } from './CalendarOverviewLowerCard'
import { MetricCard } from '../../MetricCard'
import { AlertTriangle, Calendar, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarEventsList } from '../../CalendarEventsList'
import { motion } from 'framer-motion'
import { calendarService } from '@/lib/supabase/services/calendar'
import { UserSession } from '@/types/session'
import { CreateEventForm } from './CreateEventForm'
import { EventCategory } from '@/lib/constants/categories'
import { EventPriority } from '@/types/calendar'

// Standard animation configuration
const pageTransitionConfig = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 35,
      damping: 30
    }
  }
}

interface CalendarOverviewContainerProps {
  session: UserSession
}

export function CalendarOverviewContainer({ session }: CalendarOverviewContainerProps) {
  const { setContentAndShow } = useSplitViewStore()
  const [hasInitialized, setHasInitialized] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      console.log('Current session:', session); // Debug log
      if (!session?.user?.id) {
        console.error('Invalid session:', session);
        setError('Session validation failed - please try refreshing');
        return;
      }
      
      try {
        setIsLoading(true)
        setError(null)
        
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        const end = new Date()
        end.setMonth(end.getMonth() + 2)
        
        const fetchedEvents = await calendarService.getEvents(start, end, session)
        setEvents(fetchedEvents)
      } catch (err) {
        console.error('Error loading events:', err)
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [session])

  // Calculate metrics
  const metrics = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => new Date(e.start) >= new Date()).length,
      categories: Object.entries(
        events.reduce((acc, event) => {
          const category = event.category || 'uncategorized'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      )
    }
  }, [events])

  // Initialize default split view
  useEffect(() => {
    if (!hasInitialized && events.length > 0) {
      setContentAndShow(
        <CalendarOverviewUpperCard 
          events={events}
          onViewEvents={handleViewEvents}
        />,
        <CalendarOverviewLowerCard 
          events={events}
          onCreateEvent={handleCreateEvent}
          onViewUpcoming={handleViewUpcoming}
          onJumpToday={handleJumpToday}
        />,
        'calendar-overview'
      )
      setHasInitialized(true)
    }
  }, [events, hasInitialized, setContentAndShow])

  // Handle viewing filtered events
  const handleViewEvents = useCallback((filteredEvents: CalendarEvent[], title: string) => {
    setContentAndShow(
      <CalendarOverviewUpperCard 
        events={filteredEvents}
        onViewEvents={handleViewEvents}
      />,
      <CalendarOverviewLowerCard 
        events={filteredEvents}
        onCreateEvent={handleCreateEvent}
        onViewUpcoming={handleViewUpcoming}
        onJumpToday={handleJumpToday}
      />,
      `filtered-${title}`
    )
  }, [setContentAndShow])

  // Handle viewing upcoming events
  const handleViewUpcoming = useCallback(() => {
    const upcomingEvents = events.filter(e => new Date(e.start) >= new Date())
    handleViewEvents(upcomingEvents, 'Upcoming Events')
  }, [events, handleViewEvents])

  // Handle jumping to today
  const handleJumpToday = useCallback(() => {
    const todayEvents = events.filter(e => 
      new Date(e.start).toDateString() === new Date().toDateString()
    )
    handleViewEvents(todayEvents, "Today's Events")
  }, [events, handleViewEvents])

  // Handle creating new event
  const handleCreateEvent = useCallback(() => {
    console.log('Create event clicked, session:', session); // Debug log
    
    if (!session?.user?.id) {
      console.error('No valid session for event creation:', session);
      setError('Session error - please try refreshing the page');
      return;
    }

    // Create new dates for the event
    const startTime = new Date()
    startTime.setHours(9, 0, 0, 0) // 9 AM
    
    const endTime = new Date()
    endTime.setHours(10, 0, 0, 0) // 10 AM

    // Show the create event form in split view
    const { upperCard, lowerCard } = CreateEventForm.createCards(
      async (eventData: Omit<CalendarEvent, 'id'>) => {
        try {
          console.log('Creating event with data:', eventData); // Debug log
          setIsLoading(true)
          setError(null)
          
          // Create the event in the database
          const newEvent = await calendarService.createEvent(eventData, session)
          
          console.log('Event created successfully:', newEvent); // Debug log
          
          // Update local state
          setEvents(prev => [...prev, newEvent])
          
          // Reset the split view to show the calendar overview
          setContentAndShow(
            <CalendarOverviewUpperCard 
              events={[...events, newEvent]}
              onViewEvents={handleViewEvents}
            />,
            <CalendarOverviewLowerCard 
              events={[...events, newEvent]}
              onCreateEvent={handleCreateEvent}
              onViewUpcoming={handleViewUpcoming}
              onJumpToday={handleJumpToday}
            />,
            'calendar-overview'
          )
        } catch (err) {
          console.error('Failed to create event:', err)
          setError(err instanceof Error ? err.message : 'Failed to create event')
        } finally {
          setIsLoading(false)
        }
      },
      () => {
        // Reset back to calendar overview
        setContentAndShow(
          <CalendarOverviewUpperCard 
            events={events}
            onViewEvents={handleViewEvents}
          />,
          <CalendarOverviewLowerCard 
            events={events}
            onCreateEvent={handleCreateEvent}
            onViewUpcoming={handleViewUpcoming}
            onJumpToday={handleJumpToday}
          />,
          'calendar-overview'
        )
      },
      {
        title: '',
        description: '',
        start: startTime,
        end: endTime,
        category: 'meeting',
        priority: 'medium',
        assigned_to: '',
        assigned_to_type: 'user',
        department: session?.user?.department || '',
        user_id: session?.user?.id || '',
      }
    )

    setContentAndShow(
      upperCard,
      lowerCard,
      'create-event'
    )
  }, [events, handleViewEvents, handleViewUpcoming, handleJumpToday, session, setContentAndShow])

  // Handle metric card clicks
  const handleMetricClick = useCallback((type: string) => {
    let filteredEvents: CalendarEvent[] = []
    let title = ''

    switch(type) {
      case 'upcoming':
        filteredEvents = events.filter(e => new Date(e.start) >= new Date())
        title = 'Upcoming Events'
        break
      case 'categories':
        filteredEvents = events
        title = 'Events by Category'
        break
    }

    handleViewEvents(filteredEvents, title)
  }, [events, handleViewEvents])

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <motion.div
      variants={pageTransitionConfig}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-6 p-6"
    >
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Upcoming"
          value={metrics.upcoming}
          total={metrics.total}
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          onClick={() => handleMetricClick('upcoming')}
        />
        <MetricCard
          title="Categories"
          value={metrics.categories.length}
          total={metrics.total}
          icon={<FolderKanban className="w-5 h-5 text-green-500" />}
          onClick={() => handleMetricClick('categories')}
        />
      </div>

      {/* Events List */}
      <CalendarEventsList events={events} />
    </motion.div>
  )
} 