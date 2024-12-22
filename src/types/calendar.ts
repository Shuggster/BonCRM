export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number
  endDate?: Date
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  start_time?: string
  end_time?: string
  category?: string
  isRecurrence?: boolean
  recurrence?: RecurrenceRule
  assigned_to?: string | null
  assigned_to_type?: 'user' | 'team' | null
  department?: string | null
  assignee_name?: string
  user_id?: string
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
