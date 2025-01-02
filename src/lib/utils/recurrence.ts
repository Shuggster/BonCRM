import { CalendarEvent } from '@/types/calendar'
import { addDays, addMonths, addWeeks, format, isBefore, isWithinInterval } from 'date-fns'

export function generateRecurringInstances(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  if (!event.recurring || event.recurring.frequency === 'none') {
    return [event]
  }

  const instances: CalendarEvent[] = []
  let currentDate = new Date(event.start)
  const eventDuration = event.end.getTime() - event.start.getTime()
  const interval = event.recurring.interval || 1

  // Convert exception dates to yyyy-MM-dd format for comparison
  const exceptionDates = (event.recurring.exception_dates || [])

  while (isBefore(currentDate, rangeEnd)) {
    // Check if this instance should be included based on the date range
    if (isWithinInterval(currentDate, { start: rangeStart, end: rangeEnd })) {
      // Check if this date is not in the exception dates
      const currentDateStr = format(currentDate, 'yyyy-MM-dd')
      if (!exceptionDates.includes(currentDateStr)) {
        const instanceEnd = new Date(currentDate.getTime() + eventDuration)
        instances.push({
          ...event,
          id: `${event.id}_${format(currentDate, 'yyyyMMdd')}`,
          start: new Date(currentDate),
          end: instanceEnd,
        })
      }
    }

    // Stop if we've reached the end date
    if (event.recurring.endDate && isBefore(event.recurring.endDate, currentDate)) {
      break
    }

    // Increment the date based on frequency
    switch (event.recurring.frequency) {
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
        return instances
    }
  }

  return instances
} 