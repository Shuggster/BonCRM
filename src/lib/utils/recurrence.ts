import { addDays, addMonths, addWeeks, addYears, endOfDay, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import { CalendarEvent, RecurrenceRule } from '@/types/calendar'

export function generateRecurringInstances(event: CalendarEvent, viewStart: Date, viewEnd: Date): CalendarEvent[] {
  // Convert string dates to Date objects if needed
  const startDate = typeof viewStart === 'string' ? parseISO(viewStart) : viewStart
  const endDate = typeof viewEnd === 'string' ? parseISO(viewEnd) : viewEnd
  
  // Use start of day and end of day to ensure we include events that start or end on the boundary days
  const rangeStart = startOfDay(startDate)
  const rangeEnd = endOfDay(endDate)

  // If not a recurring event and it falls within our range, return just the event
  if (!event.recurrence) {
    return [event]
  }

  const instances: CalendarEvent[] = []
  let instanceCount = 0
  const { frequency, interval = 1, endDate: recurrenceEndDate } = event.recurrence
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  const duration = eventEnd.getTime() - eventStart.getTime()

  const recurrenceEnd = recurrenceEndDate ? (typeof recurrenceEndDate === 'string' ? parseISO(recurrenceEndDate) : recurrenceEndDate) : undefined

  let currentStart = eventStart
  while ((!recurrenceEnd || isBefore(currentStart, recurrenceEnd)) && 
         isBefore(currentStart, rangeEnd)) {
    
    // If this instance falls within our view range
    if (!isBefore(currentStart, rangeStart)) {
      const currentEnd = new Date(currentStart.getTime() + duration)
      
      // Create a new instance
      instances.push({
        ...event,
        id: `${event.id}_${instanceCount}`,
        start: currentStart,
        end: currentEnd,
        isRecurring: true,
        originalEventId: event.id
      })
    }

    // Move to next instance based on frequency
    switch (frequency) {
      case 'daily':
        currentStart = addDays(currentStart, interval)
        break
      case 'weekly':
        currentStart = addWeeks(currentStart, interval)
        break
      case 'monthly':
        currentStart = addMonths(currentStart, interval)
        break
      case 'yearly':
        currentStart = addYears(currentStart, interval)
        break
    }

    instanceCount++
  }

  // Add the original event if it falls within the range
  if (!isBefore(eventEnd, rangeStart) && !isAfter(eventStart, rangeEnd)) {
    instances.unshift({
      ...event,
      isRecurring: true
    })
  }

  return instances
} 