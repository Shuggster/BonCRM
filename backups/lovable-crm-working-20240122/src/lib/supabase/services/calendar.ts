import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'
import { Session } from '@supabase/supabase-js'

export const calendarService = {
  async getEvents(session: Session) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // First get calendar events
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Then get assignments for these events
    const eventIds = events?.map(e => e.id) || []
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .in('assignable_id', eventIds)
      .eq('assignable_type', 'calendar_event')

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError)
      throw assignmentsError
    }

    // Map assignments to events
    const assignmentMap = new Map(
      assignments?.map(a => [a.assignable_id, a]) || []
    )

    return events?.map(event => {
      const assignment = assignmentMap.get(event.id)
      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        category: event.category,
        recurrence: event.recurrence,
        assigned_to: assignment?.assigned_to || null,
        assigned_to_type: assignment?.assigned_to_type || null,
        department: event.department || null
      }
    }) || []
  },

  async createEvent(session: Session, event: Omit<CalendarEvent, 'id'>) {
    // First create the event
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence,
        user_id: session.user.id,
        department: event.department
      })
      .select()
      .single()

    if (eventError) {
      console.error('Supabase error:', eventError)
      throw eventError
    }

    // Then create the assignment if needed
    if (event.assigned_to && event.assigned_to_type) {
      const { error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          assignable_id: eventData.id,
          assignable_type: 'calendar_event',
          assigned_to: event.assigned_to,
          assigned_to_type: event.assigned_to_type
        })

      if (assignmentError) {
        console.error('Assignment error:', assignmentError)
        // Clean up the event since assignment failed
        await supabase
          .from('calendar_events')
          .delete()
          .eq('id', eventData.id)
        throw assignmentError
      }
    }

    return {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || '',
      start: new Date(eventData.start_time),
      end: new Date(eventData.end_time),
      category: eventData.category,
      recurrence: eventData.recurrence,
      assigned_to: event.assigned_to || null,
      assigned_to_type: event.assigned_to_type || null,
      department: eventData.department || null
    }
  },

  async updateEvent(session: Session, id: string, event: Partial<CalendarEvent>) {
    // First update the event
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .update({
        title: event.title,
        description: event.description,
        start_time: event.start?.toISOString(),
        end_time: event.end?.toISOString(),
        category: event.category,
        recurrence: event.recurrence,
        department: event.department
      })
      .eq('id', id)
      .select()
      .single()

    if (eventError) {
      console.error('Supabase error:', eventError)
      throw eventError
    }

    // Then handle assignment
    if (event.assigned_to && event.assigned_to_type) {
      // Update or create assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .upsert({
          assignable_id: id,
          assignable_type: 'calendar_event',
          assigned_to: event.assigned_to,
          assigned_to_type: event.assigned_to_type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'assignable_id,assignable_type,assigned_to,assigned_to_type'
        })

      if (assignmentError) {
        console.error('Assignment error:', assignmentError)
        throw assignmentError
      }
    } else {
      // Remove assignment if it exists
      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('assignable_id', id)
        .eq('assignable_type', 'calendar_event')

      if (deleteError) {
        console.error('Error removing assignment:', deleteError)
        throw deleteError
      }
    }

    return {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || '',
      start: new Date(eventData.start_time),
      end: new Date(eventData.end_time),
      category: eventData.category,
      recurrence: eventData.recurrence,
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: eventData.department
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