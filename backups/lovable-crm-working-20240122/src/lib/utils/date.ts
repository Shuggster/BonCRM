import { 
  startOfDay, 
  endOfDay, 
  isWithinInterval, 
  isSameDay, 
  differenceInDays 
} from "date-fns"

export function isMultiDayEvent(event: CalendarEvent): boolean {
  return !isSameDay(event.start, event.end)
}

export function getEventDuration(event: CalendarEvent): number {
  return differenceInDays(endOfDay(event.end), startOfDay(event.start)) + 1
}

export function isEventInDay(event: CalendarEvent, date: Date): boolean {
  return isWithinInterval(date, {
    start: startOfDay(event.start),
    end: endOfDay(event.end)
  })
}

export function getEventPositionInDay(event: CalendarEvent, date: Date) {
  const isStart = isSameDay(event.start, date)
  const isEnd = isSameDay(event.end, date)
  
  return { isStart, isEnd }
} 