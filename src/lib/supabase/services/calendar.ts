import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'

export const calendarService = {
  async getEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return data?.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      start: new Date(row.start_time),
      end: new Date(row.end_time),
      category: row.category,
      recurrence: row.recurrence,
      assigned_to: row.assigned_to,
      assigned_to_type: row.assigned_to_type,
      department: row.department
    })) || []
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>) {
    const assignmentFields = event.assigned_to && event.assigned_to_type ? {
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: event.department
    } : {}

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence,
        ...assignmentFields
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return {
      ...data,
      start: new Date(data.start_time),
      end: new Date(data.end_time)
    }
  },

  async updateEvent(event: CalendarEvent) {
    console.log('Updating event with data:', event);
    
    const assignmentFields = event.assigned_to && event.assigned_to_type ? {
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: event.department
    } : {
      assigned_to: null,
      assigned_to_type: null,
      department: null
    }

    console.log('Assignment fields:', assignmentFields);

    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence,
        ...assignmentFields
      })
      .eq('id', event.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return {
      ...data,
      start: new Date(data.start_time),
      end: new Date(data.end_time)
    }
  },

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
  }
} 