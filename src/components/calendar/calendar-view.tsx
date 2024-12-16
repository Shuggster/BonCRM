"use client"

import { useState } from 'react'
import { CalendarViewToggle } from './calendar-view-toggle'
import { MonthView, WeekView, DayView } from './views'
import { CalendarEvent } from '@/types/calendar'

type ViewType = 'month' | 'week' | 'day'

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function CalendarView({ events = [], onEventClick }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('month')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CalendarViewToggle
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {currentView === 'month' && <MonthView events={events} onEventClick={onEventClick} />}
      {currentView === 'week' && <WeekView events={events} onEventClick={onEventClick} />}
      {currentView === 'day' && (
        <DayView 
          events={events} 
          onEventClick={onEventClick} 
        />
      )}
    </div>
  )
}
