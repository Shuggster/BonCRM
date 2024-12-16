import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'
import { CalendarEventRow } from '../schema'

export const calendarService = {
  async getEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) throw error

    return data?.map((row: CalendarEventRow): CalendarEvent => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      start: new Date(row.start_time),
      end: new Date(row.end_time),
      category: row.category,
      recurrence: row.recurrence
    })) || []
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEvent(event: CalendarEvent) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence
      })
      .eq('id', event.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 