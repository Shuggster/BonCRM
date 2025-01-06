"use client"

import { useState } from 'react'
import { CalendarEvent } from '@/types/calendar'
import { MonthView } from './views/month-view'
import { WeekView } from './views/week-view'
import { DayView } from './views/day-view'
import { CalendarViewToggle } from './CalendarViewToggle'
import { motion } from 'framer-motion'
import { fadeInVariants } from '@/lib/animations'

type ViewType = 'month' | 'week' | 'day'

interface CalendarOverviewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (event: CalendarEvent, newStart: Date) => void
  onEventCreate?: (start: Date, end: Date) => void
  onEventResize?: (event: CalendarEvent, start: Date, end: Date) => void
}

export function CalendarOverview({
  events,
  onEventClick,
  onEventDrop,
  onEventCreate,
  onEventResize
}: CalendarOverviewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const renderView = () => {
    switch (currentView) {
      case 'month':
        return (
          <MonthView
            events={events}
            onEventClick={onEventClick}
            onEventDrop={onEventDrop}
            currentDate={currentDate}
          />
        )
      case 'week':
        return (
          <WeekView
            events={events}
            onEventClick={onEventClick}
            onEventDrop={onEventDrop}
            onEventCreate={onEventCreate}
            onEventResize={onEventResize}
            currentDate={currentDate}
          />
        )
      case 'day':
        return (
          <DayView
            events={events}
            onEventClick={onEventClick}
            onEventCreate={onEventCreate}
            onEventResize={onEventResize}
            currentDate={currentDate}
          />
        )
    }
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <CalendarViewToggle
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>
      {renderView()}
    </motion.div>
  )
} 