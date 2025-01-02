import { EventCategory } from '@/lib/constants/categories'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type EventPriority = 'high' | 'medium' | 'low'

export type RecurringEventDeleteOption = 'single' | 'future' | 'all'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number
  endDate?: Date
  exceptionDates?: Date[]
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
  description?: string
  start: Date
  end: Date
  category?: EventCategory
  priority?: EventPriority
  location?: string
  isOnline?: boolean
  meetingLink?: string
  recurring?: RecurringOptions
  reminders?: string[]
  attendees?: string[]
  user_id?: string
  department?: string | null
  assigned_to?: string | null
  assigned_to_type?: 'user' | 'team' | null
  created_at?: Date
  updated_at?: Date
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
