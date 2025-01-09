import { CalendarEvent } from '@/types/calendar'
import { addDays, addMonths, addWeeks, format, isBefore, isWithinInterval, startOfDay } from 'date-fns'

export function generateRecurringInstances(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  console.log('Generating instances for event:', {
    id: event.id,
    title: event.title,
    start: event.start,
    recurrence: event.recurrence,
    rangeStart,
    rangeEnd
  })

  if (!event.recurrence) {
    console.log('No recurrence data, returning original event')
    return [event]
  }

  const instances: CalendarEvent[] = []
  let currentDate = new Date(event.start)
  const eventDuration = event.end.getTime() - event.start.getTime()
  const interval = event.recurrence.interval || 1

  console.log('Recurrence details:', {
    frequency: event.recurrence.frequency,
    interval: interval,
    endDate: event.recurrence.endDate,
    exceptionDates: event.recurrence.exception_dates,
    currentDate,
    eventDuration
  })

  // Convert exception dates to yyyy-MM-dd format for comparison
  const exceptionDates = (event.recurrence.exception_dates || [])

  // Convert end date to start of day for proper comparison
  const recurrenceEndDate = event.recurrence.endDate ? startOfDay(new Date(event.recurrence.endDate)) : undefined

  // Ensure we don't exceed the range end date
  while (isBefore(currentDate, rangeEnd)) {
    // Check if this instance should be included based on the date range
    if (isWithinInterval(currentDate, { start: rangeStart, end: rangeEnd })) {
      // Check if this date is not in the exception dates
      const currentDateStr = format(currentDate, 'yyyy-MM-dd')
      console.log('Processing date:', {
        currentDate,
        currentDateStr,
        exceptionDates,
        isException: exceptionDates.includes(currentDateStr)
      })
      
      // Only stop if we've reached the recurrence end date AND we're past it
      if (recurrenceEndDate && isBefore(recurrenceEndDate, startOfDay(currentDate))) {
        console.log('Reached recurrence end date:', {
          currentDate,
          recurrenceEndDate
        })
        break
      }

      if (!exceptionDates.includes(currentDateStr)) {
        const instanceEnd = new Date(currentDate.getTime() + eventDuration)
        
        // Create a unique instance ID that includes both the original event ID and the date
        const instanceId = `${event.id}_${format(currentDate, 'yyyyMMddHHmmss')}`
        
        console.log('Creating instance:', {
          id: instanceId,
          date: currentDate,
          endDate: instanceEnd
        })

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

    // Increment the date based on frequency
    const previousDate = new Date(currentDate)
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
    console.log('Advanced date:', {
      from: previousDate,
      to: currentDate,
      frequency: event.recurrence.frequency,
      interval
    })
  }

  console.log(`Generated ${instances.length} instances for event ${event.id}`)
  return instances
} 