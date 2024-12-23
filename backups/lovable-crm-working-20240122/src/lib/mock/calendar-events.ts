import { addDays, addHours, addWeeks, setHours, startOfDay, subDays } from "date-fns"
import { CalendarEvent } from "@/types/calendar"

const today = new Date()
const startOfToday = startOfDay(today)

export const MOCK_EVENTS: CalendarEvent[] = [
  // Today's events spread throughout the day
  {
    id: '1',
    title: 'Morning Standup',
    description: 'Daily team sync meeting',
    start: setHours(startOfToday, 9),
    end: setHours(startOfToday, 10),
    category: 'meeting'
  },
  {
    id: '2',
    title: 'Client Meeting',
    description: 'Project review with client',
    start: setHours(startOfToday, 11),
    end: setHours(startOfToday, 12),
    category: 'call'
  },
  {
    id: '3',
    title: 'Lunch Break',
    description: 'Team lunch',
    start: setHours(startOfToday, 12),
    end: setHours(startOfToday, 13),
    category: 'break'
  },
  {
    id: '4',
    title: 'Development Time',
    description: 'Focused coding session',
    start: setHours(startOfToday, 14),
    end: setHours(startOfToday, 16),
    category: 'work'
  },
  {
    id: '5',
    title: 'Team Review',
    description: 'End of day review',
    start: setHours(startOfToday, 16),
    end: setHours(startOfToday, 17),
    category: 'meeting'
  },

  // Tomorrow's events
  {
    id: '6',
    title: 'Sprint Planning',
    description: 'Weekly sprint planning',
    start: setHours(addDays(startOfToday, 1), 10),
    end: setHours(addDays(startOfToday, 1), 12),
    category: 'meeting'
  },
  {
    id: '7',
    title: 'Design Review',
    description: 'UI/UX review session',
    start: setHours(addDays(startOfToday, 1), 14),
    end: setHours(addDays(startOfToday, 1), 15),
    category: 'design'
  },

  // Later this week
  {
    id: '8',
    title: 'Product Demo',
    description: 'Monthly product demonstration',
    start: setHours(addDays(startOfToday, 2), 13),
    end: setHours(addDays(startOfToday, 2), 14),
    category: 'presentation'
  },

  // Multi-day event
  {
    id: '9',
    title: 'Company Conference',
    description: 'Annual company conference',
    start: setHours(addDays(startOfToday, 3), 9),
    end: setHours(addDays(startOfToday, 5), 17),
    category: 'conference'
  },

  // Recurring events
  {
    id: '10',
    title: 'Weekly Team Sync',
    description: 'Weekly team coordination',
    start: setHours(startOfToday, 10),
    end: setHours(startOfToday, 11),
    category: 'meeting',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      endDate: addWeeks(startOfToday, 12)
    }
  },
  {
    id: '11',
    title: 'Daily Standup',
    description: 'Daily team check-in',
    start: setHours(startOfToday, 9),
    end: setHours(startOfToday, 9, 30),
    category: 'meeting',
    recurrence: {
      frequency: 'daily',
      interval: 1,
      endDate: addWeeks(startOfToday, 2)
    }
  }
]