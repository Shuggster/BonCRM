'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarOverviewContainer } from './CalendarOverviewContainer'
import { CalendarEventsList } from './CalendarEventsList'
import { CalendarEvent, EventPriority } from '@/types/calendar'
import { EventCategory } from '@/lib/constants/categories'
import { addDays, subDays, format } from 'date-fns'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { CreateEventForm } from './CreateEventForm'
import { CalendarOverviewUpperCard } from './CalendarOverviewUpperCard'
import { CalendarOverviewLowerCard } from './CalendarOverviewLowerCard'

export function TestCalendarOverview() {
  const { setContentAndShow, reset } = useSplitViewStore()
  const [currentView, setCurrentView] = useState<'overview' | 'filtered'>('overview')

  // Mock events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync to discuss progress',
      start: new Date(),
      end: addDays(new Date(), 1),
      category: 'meeting',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Project Review',
      description: 'Review Q4 project milestones',
      start: addDays(new Date(), 1),
      end: addDays(new Date(), 2),
      category: 'work',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Client Call',
      description: 'Discuss new requirements',
      start: subDays(new Date(), 1),
      end: subDays(new Date(), 1),
      category: 'call',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Team Sync',
      description: 'Daily standup',
      start: new Date(),
      end: new Date(),
      category: 'meeting',
      priority: 'low'
    },
    {
      id: '5',
      title: 'Product Demo',
      description: 'Show new features to stakeholders',
      start: addDays(new Date(), 3),
      end: addDays(new Date(), 3),
      category: 'work',
      priority: 'medium'
    }
  ]

  // State for events
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)

  // Handle viewing filtered events
  const handleViewEvents = useCallback((filteredEvents: CalendarEvent[], title: string) => {
    // Reset the current view
    reset()
    
    // Short delay to allow animation to complete
    setTimeout(() => {
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
        'filtered-events'
      )
      setCurrentView('filtered')
    }, 100)
  }, [setContentAndShow, reset])

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
  const handleCreateEvent = useCallback((defaultEvent?: Omit<CalendarEvent, 'id'>) => {
    const handleSubmit = (eventData: Omit<CalendarEvent, 'id'>) => {
      console.log('Submit handler called with data:', eventData)
      
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        ...eventData,
        created_at: new Date(),
        updated_at: new Date()
      }
      console.log('New event created:', newEvent)
      
      setEvents(prev => {
        console.log('Previous events:', prev)
        const updated = [...prev, newEvent]
        console.log('Updated events:', updated)
        return updated
      })

      // Reset view after state update
      reset()
      setCurrentView('overview')
    }

    const handleCancel = () => {
      console.log('Cancel handler called')
      reset()
      setCurrentView('overview')
    }

    console.log('Creating event with default values:', defaultEvent)
    const defaultValues = defaultEvent || {
      title: '',
      description: '',
      start: new Date(),
      end: new Date(),
      category: 'meeting',
      priority: 'medium',
      isOnline: false,
      recurring: {
        frequency: 'none',
        interval: 1,
        endDate: null,
        weekdays: []
      },
      reminders: [],
      attendees: []
    }
    console.log('Using values:', defaultValues)

    const { upperCard, lowerCard } = CreateEventForm.createCards(
      handleSubmit,
      handleCancel,
      defaultValues
    )

    setContentAndShow(
      upperCard,
      lowerCard,
      'create-event'
    )
  }, [setContentAndShow, reset, setCurrentView])

  // Effect to update the view when events change
  useEffect(() => {
    if (currentView === 'overview') {
      console.log('Updating overview with events:', events)
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
    }
  }, [events, currentView, handleViewEvents, handleCreateEvent, handleViewUpcoming, handleJumpToday, setContentAndShow])

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">Calendar Overview Test</h1>
          
          <div className="space-x-4">
            {currentView === 'filtered' && (
              <Button
                variant="outline"
                onClick={() => {
                  reset()
                  setTimeout(() => {
                    setCurrentView('overview')
                  }, 100)
                }}
              >
                Back to Overview
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleCreateEvent()}
            >
              Add Test Event
            </Button>
          </div>
        </div>

        {/* Calendar Overview Component */}
        {currentView === 'overview' && (
          <CalendarOverviewContainer
            events={events}
            onViewEvents={handleViewEvents}
            onCreateEvent={handleCreateEvent}
            onViewUpcoming={handleViewUpcoming}
            onJumpToday={handleJumpToday}
          />
        )}

        {/* Test Information */}
        <div className="mt-8 p-6 rounded-lg bg-white/5 border border-white/10">
          <h2 className="text-lg font-medium text-white mb-4">Test Information</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>• Total Events: {events.length}</p>
            <p>• Categories: {Array.from(new Set(events.map(e => e.category))).join(', ')}</p>
            <p>• Click on metric cards to view filtered events</p>
            <p>• Check console for button click logs</p>
          </div>
        </div>
      </div>
    </div>
  )
} 