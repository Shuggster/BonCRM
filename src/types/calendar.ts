export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category?: string;
  location?: string;
  attendees?: string[];
  createdBy?: string;
  updatedAt?: Date;
  color?: string;
}

export type ViewType = 'month' | 'week' | 'day';

export interface EventFilter {
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}
