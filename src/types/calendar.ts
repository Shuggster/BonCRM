import { EventCategory } from '@/lib/constants/categories'
import { StatusType } from '@/components/calendar/new/StatusFilter'
import { PriorityType } from '@/components/calendar/new/PriorityFilter'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type EventPriority = 'high' | 'medium' | 'low'

export type RecurringEventDeleteOption = 'single' | 'future' | 'all'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: Date | null
  exception_dates?: string[]
}

export interface RecurringOptions {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  endDate?: Date | null
  interval?: number
  weekdays?: string[]
  exception_dates?: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  category: EventCategory
  user_id: string
  status?: StatusType
  priority?: PriorityType
  type?: string
  assigned_to?: string | null
  assigned_to_type?: string | null
  department?: string | null
  location?: string | null
  recurrence?: RecurrenceRule | null
  is_recurring_instance?: boolean
  original_event_id?: string
  instance_date?: string
}

export interface EventWithLayout extends CalendarEvent {
  column: number
  width: number
  totalColumns: number
}

export type ViewType = 'month' | 'week' | 'day'

export interface CalendarView {
  type: ViewType
  start: Date
  end: Date
}

export interface EventFilter {
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}
