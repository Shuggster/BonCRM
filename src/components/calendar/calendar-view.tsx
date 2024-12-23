"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CalendarEvent, ViewType } from "@/types/calendar"
import { CalendarViewToggle } from './calendar-view-toggle'
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { MonthView } from './views/month-view'
import { WeekView } from './views/week-view'
import { DayView } from './views/day-view'
import { EventModal } from './event-modal'
import { CalendarDndContext } from './calendar-dnd-context'
import { subMonths, addMonths, subWeeks, addWeeks, subDays, addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { generateRecurringInstances } from '@/lib/utils/recurrence'
import { UserSession } from '@/types/users'

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
  const [showEventModal, setShowEventModal] = useState(false)
  const [newEventTime, setNewEventTime] = useState<{ start: Date; end: Date } | null>(null)
  const [currentDate, setCurrentDate] = useState(selectedDate)

  useEffect(() => {
    setCurrentDate(selectedDate)
  }, [selectedDate])

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    onDateChange?.(date)
  }, [onDateChange])

  const handlePrevious = useCallback(() => {
    const newDate = (() => {
      switch (currentView) {
        case 'month':
          return subMonths(currentDate, 1)
        case 'week':
          return subWeeks(currentDate, 1)
        case 'day':
          return subDays(currentDate, 1)
        default:
          return currentDate
      }
    })()
    handleDateChange(newDate)
  }, [currentView, currentDate, handleDateChange])

  const handleNext = useCallback(() => {
    const newDate = (() => {
      switch (currentView) {
        case 'month':
          return addMonths(currentDate, 1)
        case 'week':
          return addWeeks(currentDate, 1)
        case 'day':
          return addDays(currentDate, 1)
        default:
          return currentDate
      }
    })()
    handleDateChange(newDate)
  }, [currentView, currentDate, handleDateChange])

  const handleEventCreate = useCallback((eventData: Partial<CalendarEvent>) => {
    if (eventData.start && eventData.end) {
      setNewEventTime({ start: eventData.start, end: eventData.end })
      setShowEventModal(true)
    }
  }, [])

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>) => {
    if (newEventTime) {
      onEventCreate({
        ...eventData,
        start: newEventTime.start,
        end: newEventTime.end,
        title: eventData.title || '',
        description: eventData.description || '',
        category: eventData.category || 'default'
      })
    }
    setShowEventModal(false)
    setNewEventTime(null)
  }, [newEventTime, onEventCreate])

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
          />
        )
      case 'week':
        return (
          <WeekView 
            events={visibleEvents} 
            onEventClick={onEventClick}
            currentDate={currentDate}
          />
        )
      case 'day':
        return (
          <DayView 
            events={visibleEvents} 
            onEventClick={onEventClick}
            onEventCreate={handleEventCreate}
            onEventResize={onEventResize}
            currentDate={currentDate}
          />
        )
      default:
        return null
    }
  }, [currentView, visibleEvents, currentDate, onEventClick, onEventDrop, handleEventCreate, onEventResize])

  return (
    <CalendarDndContext onEventDrop={onEventDrop}>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-[#0F1629]/50 backdrop-blur-xl rounded-lg border border-white/[0.08] shadow-xl p-4">
          <div className="flex items-center gap-4">
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
                "bg-[#1C2333] text-gray-300 hover:text-gray-200",
                "border-white/10 hover:bg-[#1C2333]/80",
                "transition-all duration-200"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Today
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1C2333] rounded-md border border-white/10 p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className={cn(
                  "h-7 w-7",
                  "text-gray-400 hover:text-gray-300",
                  "hover:bg-white/5",
                  "transition-all duration-200"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center text-gray-200">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className={cn(
                  "h-7 w-7",
                  "text-gray-400 hover:text-gray-300",
                  "hover:bg-white/5",
                  "transition-all duration-200"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[#0F1629]/30 backdrop-blur-xl rounded-lg border border-white/[0.08] shadow-xl overflow-hidden">
          {currentViewComponent}
        </div>

        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setNewEventTime(null)
          }}
          onSave={handleSaveEvent}
          initialData={newEventTime ? {
            title: '',
            description: '',
            category: 'default',
            start: newEventTime.start,
            end: newEventTime.end
          } : undefined}
          session={session}
        />
      </div>
    </CalendarDndContext>
  )
}
