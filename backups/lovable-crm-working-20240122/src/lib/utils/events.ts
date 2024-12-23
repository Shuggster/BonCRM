import { CalendarEvent, EventWithLayout } from "@/types/calendar"
import { isWithinInterval, areIntervalsOverlapping } from "date-fns"

export function doEventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return areIntervalsOverlapping(
    { start: event1.start, end: event1.end },
    { start: event2.start, end: event2.end }
  )
}

export function layoutEvents(events: CalendarEvent[]): EventWithLayout[] {
  if (!events.length) return []

  // Sort events by start time and duration
  const sortedEvents = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime()
    if (startDiff === 0) {
      return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime())
    }
    return startDiff
  })

  const columns: EventWithLayout[][] = []
  const layoutEvents: EventWithLayout[] = []

  sortedEvents.forEach(event => {
    // Find first column where event doesn't overlap
    let columnIndex = 0
    let foundColumn = false

    while (!foundColumn) {
      const column = columns[columnIndex]
      
      if (!column) {
        // Create new column
        const layoutEvent: EventWithLayout = {
          ...event,
          column: columnIndex,
          width: 1,
          totalColumns: 1
        }
        columns[columnIndex] = [layoutEvent]
        layoutEvents.push(layoutEvent)
        foundColumn = true
      } else {
        // Check if event overlaps with any event in this column
        const overlaps = column.some(existingEvent => 
          doEventsOverlap(event, existingEvent)
        )

        if (!overlaps) {
          const layoutEvent: EventWithLayout = {
            ...event,
            column: columnIndex,
            width: 1,
            totalColumns: 1
          }
          column.push(layoutEvent)
          layoutEvents.push(layoutEvent)
          foundColumn = true
        }
      }
      columnIndex++
    }
  })

  // Update widths and total columns
  layoutEvents.forEach(event => {
    event.totalColumns = columns.length
    // Optionally, calculate width based on consecutive non-overlapping columns
    let width = 1
    for (let i = event.column + 1; i < columns.length; i++) {
      if (columns[i].some(e => doEventsOverlap(event, e))) break
      width++
    }
    event.width = width
  })

  return layoutEvents
} 