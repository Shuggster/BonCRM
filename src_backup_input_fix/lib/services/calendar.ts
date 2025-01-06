import { CalendarEvent } from '@/types/calendar'

export const calendarService = {
  async createEvent(event: Omit<CalendarEvent, 'id'>) {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        category: event.category,
        department: event.department,
        assigned_to: event.assigned_to,
        assigned_to_type: event.assigned_to_type
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
  },

  async getEvents(start: Date, end: Date) {
    const response = await fetch(`/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch events');
    }

    return response.json();
  },

  async updateEvent(event: Partial<CalendarEvent> & { id: string }) {
    const response = await fetch(`/api/calendar/events?id=${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        category: event.category,
        department: event.department,
        assigned_to: event.assigned_to,
        assigned_to_type: event.assigned_to_type
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    return response.json();
  }
} 