import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'
import { UserSession } from '@/types/users'

export const calendarClient = {
  async getEvents(start: Date, end: Date, session: UserSession) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // First get calendar events within the date range
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('start_time', start.toISOString())
      .lte('end_time', end.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Then get assignments for these events from assignments table
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
      // Check both places for assignment data
      const assignment = assignmentMap.get(event.id)
      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        category: event.category,
        recurrence: event.recurrence,
        // First try assignment table, then fall back to direct fields
        assigned_to: assignment?.assigned_to || event.assigned_to || undefined,
        assigned_to_type: assignment?.assigned_to_type || event.assigned_to_type || undefined,
        department: event.department || undefined,
        user_id: event.user_id,
        status: 'scheduled',
        priority: 'medium',
        type: 'meeting'
      }
    }) || []
  },

  async createEvent(session: UserSession, event: Omit<CalendarEvent, 'id'>) {
    // First create the event
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category,
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          end_date: event.recurrence.endDate?.toISOString()
        } : null,
        user_id: session.user.id,
        department: event.department || undefined
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

    // Return the event with assignment data
    return {
      ...eventData,
      start: new Date(eventData.start_time),
      end: new Date(eventData.end_time),
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined,
      recurrence: event.recurrence ? {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval || 1,
        end_date: event.recurrence.endDate
      } : undefined
    }
  }
} 