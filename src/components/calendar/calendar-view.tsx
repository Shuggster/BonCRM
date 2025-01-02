"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarEvent, ViewType } from "@/types/calendar"
import { CalendarViewToggle } from './calendar-view-toggle'
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { MonthView } from './new/views/month-view'
import { WeekView } from './new/views/week-view'
import { DayView } from './new/views/day-view'
import { EventModal } from './event-modal'
import { CalendarDndContext } from './calendar-dnd-context'
import { subMonths, addMonths, subWeeks, addWeeks, subDays, addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { generateRecurringInstances } from '@/lib/utils/recurrence'
import { UserSession } from '@/types/session'

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (event: CalendarEvent, newStart: Date) => void
  onEventCreate: (event: Partial<CalendarEvent>) => void
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
  onDateChange?: (date: Date) => void
  selectedDate?: Date
  session: UserSession
}

export function CalendarView({ 
  events, 
  onEventClick, 
  onEventDrop, 
  onEventCreate,
  onEventResize,
  onDateChange,
  selectedDate = new Date(),
  session
}: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [showEventModal, setShowEventModal] = useState(false)
  const [newEventTime, setNewEventTime] = useState<{ start: Date; end: Date } | null>(null)

  useEffect(() => {
    setCurrentDate(selectedDate)
  }, [selectedDate])

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    onDateChange?.(date)
  }, [onDateChange])

  const getNavigationText = useCallback(() => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'week':
        const weekStart = startOfWeek(currentDate)
        const weekEnd = endOfWeek(currentDate)
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      default:
        return format(currentDate, 'MMMM yyyy')
    }
  }, [currentDate, currentView])

  const handlePrevious = useCallback(() => {
    switch (currentView) {
      case 'month':
        handleDateChange(subMonths(currentDate, 1))
        break
      case 'week':
        handleDateChange(subWeeks(currentDate, 1))
        break
      case 'day':
        handleDateChange(subDays(currentDate, 1))
        break
    }
  }, [currentView, currentDate, handleDateChange])

  const handleNext = useCallback(() => {
    switch (currentView) {
      case 'month':
        handleDateChange(addMonths(currentDate, 1))
        break
      case 'week':
        handleDateChange(addWeeks(currentDate, 1))
        break
      case 'day':
        handleDateChange(addDays(currentDate, 1))
        break
    }
  }, [currentView, currentDate, handleDateChange])

  const handleEventCreate = (start: Date, end: Date) => {
    setNewEventTime({ start, end })
    setShowEventModal(true)
  }

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (newEventTime) {
      onEventCreate({
        ...eventData,
        start: newEventTime.start,
        end: newEventTime.end
      })
    }
    setShowEventModal(false)
    setNewEventTime(null)
  }

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    switch (e.key) {
      case 't':
        handleDateChange(new Date())
        break
      case 'm':
        setCurrentView('month')
        break
      case 'w':
        setCurrentView('week')
        break
      case 'd':
        setCurrentView('day')
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
    }
  }, [handleDateChange, handlePrevious, handleNext])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const visibleEvents = useMemo(() => {
    let rangeStart: Date
    let rangeEnd: Date

    switch (currentView) {
      case 'month':
        rangeStart = startOfMonth(currentDate)
        rangeEnd = endOfMonth(currentDate)
        break
      case 'week':
        rangeStart = startOfWeek(currentDate)
        rangeEnd = endOfWeek(currentDate)
        break
      case 'day':
        rangeStart = currentDate
        rangeEnd = addDays(currentDate, 1)
        break
      default:
        rangeStart = currentDate
        rangeEnd = currentDate
    }

    // Generate recurring instances for each event
    return events.flatMap(event => generateRecurringInstances(event, rangeStart, rangeEnd))
  }, [events, currentView, currentDate])

  const currentViewComponent = useMemo(() => {
    switch (currentView) {
      case 'month':
        return (
          <MonthView 
            events={visibleEvents} 
            onEventClick={onEventClick}
            onEventDrop={onEventDrop}
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        )
      case 'week':
        return (
          <WeekView 
            events={visibleEvents} 
            onEventClick={onEventClick}
            onEventCreate={handleEventCreate}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        )
      case 'day':
        return (
          <DayView 
            events={visibleEvents} 
            onEventClick={onEventClick}
            onEventCreate={handleEventCreate}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        )
      default:
        return null
    }
  }, [currentView, visibleEvents, currentDate, onEventClick, onEventDrop, handleEventCreate, onEventResize, handleDateChange])

  return (
    <CalendarDndContext onEventDrop={onEventDrop}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#111111] rounded-xl border border-white/[0.08] p-4">
          <div className="flex items-center gap-6">
            <CalendarViewToggle
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange(new Date())}
              className={cn(
                "gap-2 px-4 py-2 h-9",
                "bg-[#111111] text-white hover:text-white",
                "border-white/10 hover:bg-white/[0.02]",
                "transition-all duration-200"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Jump to Today
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-[#111111] rounded-lg border border-white/10 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className={cn(
                  "gap-2 px-3 h-8",
                  "text-white/70 hover:text-white",
                  "hover:bg-white/[0.02]",
                  "transition-all duration-200"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous {currentView}
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center text-white">
                {getNavigationText()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className={cn(
                  "gap-2 px-3 h-8",
                  "text-white/70 hover:text-white",
                  "hover:bg-white/[0.02]",
                  "transition-all duration-200"
                )}
              >
                Next {currentView}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] rounded-xl border border-white/[0.08]">
          {currentViewComponent}
        </div>

        {showEventModal && newEventTime && (
          <EventModal
            isOpen={showEventModal}
            onClose={() => {
              setShowEventModal(false)
              setNewEventTime(null)
            }}
            onSave={handleSaveEvent}
            initialData={{
              title: '',
              description: '',
              category: 'default',
              start: newEventTime.start,
              end: newEventTime.end
            }}
            session={session}
          />
        )}
      </div>
    </CalendarDndContext>
  )
}
