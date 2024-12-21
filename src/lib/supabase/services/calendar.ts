import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'
import { Session } from '@supabase/supabase-js'

export const calendarService = {
  async getEvents(session: Session) {
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

  async createEvent(session: Session, event: Omit<CalendarEvent, 'id'>) {
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
        user_id: session.user.id,
        ...assignmentFields
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      category: data.category,
      recurrence: data.recurrence,
      assigned_to: data.assigned_to,
      assigned_to_type: data.assigned_to_type,
      department: data.department
    }
  },

  async updateEvent(session: Session, id: string, event: Partial<CalendarEvent>) {
    const assignmentFields = event.assigned_to && event.assigned_to_type ? {
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: event.department
    } : {
      assigned_to: null,
      assigned_to_type: null,
      department: null
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        title: event.title,
        description: event.description,
        start_time: event.start?.toISOString(),
        end_time: event.end?.toISOString(),
        category: event.category,
        recurrence: event.recurrence,
        ...assignmentFields
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      category: data.category,
      recurrence: data.recurrence,
      assigned_to: data.assigned_to,
      assigned_to_type: data.assigned_to_type,
      department: data.department
    }
  },

  async deleteEvent(session: Session, id: string) {
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