import { CalendarEvent } from '@/types/calendar'
import { addDays, addMonths, addWeeks, format, isBefore, isWithinInterval } from 'date-fns'

export function generateRecurringInstances(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  if (!event.recurrence) {
    return [event]
  }

  const instances: CalendarEvent[] = []
  let currentDate = new Date(event.start)
  const eventDuration = event.end.getTime() - event.start.getTime()
  const interval = event.recurrence.interval || 1

  // Convert exception dates to yyyy-MM-dd format for comparison
  const exceptionDates = (event.recurrence.exception_dates || [])

  while (isBefore(currentDate, rangeEnd)) {
    // Check if this instance should be included based on the date range
    if (isWithinInterval(currentDate, { start: rangeStart, end: rangeEnd })) {
      // Check if this date is not in the exception dates
      const currentDateStr = format(currentDate, 'yyyy-MM-dd')
      if (!exceptionDates.includes(currentDateStr)) {
        const instanceEnd = new Date(currentDate.getTime() + eventDuration)
        
        // Create a unique instance ID that includes both the original event ID and the date
        // This ensures each instance has a truly unique identifier
        const instanceId = `${event.id}_${format(currentDate, 'yyyyMMddHHmmss')}`
        
        instances.push({
          ...event,
          id: instanceId,
          start: new Date(currentDate),
          end: instanceEnd,
          is_recurring_instance: true,
          original_event_id: event.id,
          instance_date: currentDate.toISOString()
        })
      }
    }

    // Stop if we've reached the end date
    if (event.recurrence.endDate && isBefore(event.recurrence.endDate, currentDate)) {
      break
    }

    // Increment the date based on frequency
    switch (event.recurrence.frequency) {
      case 'daily':
        currentDate = addDays(currentDate, interval)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, interval)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, interval)
        break
      default:
        throw new Error(`Unsupported frequency: ${event.recurrence.frequency}`)
    }
  }

  return instances
} 