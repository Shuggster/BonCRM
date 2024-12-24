import { supabase } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/calendar'
import { UserSession } from '@/types/users'

export const calendarService = {
  async getDepartments(session: UserSession): Promise<string[]> {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // If not admin, return only user's department
    if (session.user.role !== 'admin') {
      return session.user.department ? [session.user.department] : []
    }

    // For admins, get all departments from users
    const { data, error } = await supabase
      .from('users')
      .select('department')
      .not('department', 'is', null)
      .order('department')

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Get unique departments
    const departments = [...new Set(data.map(user => user.department))]
    return departments
  },

  async getUsers(session: UserSession): Promise<{ id: string; name: string }[]> {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // If not admin, return only the current user
    if (session.user.role !== 'admin') {
      return [{
        id: session.user.id,
        name: session.user.name || session.user.email
      }]
    }

    // For admins, get all users
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .order('name')

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data.map(user => ({
      id: user.id,
      name: user.name || user.email
    }))
  },

  async getEvents(session: UserSession) {
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
        category: event.category || 'default',
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
        } : undefined,
        assigned_to: assignment?.assigned_to || undefined,
        assigned_to_type: assignment?.assigned_to_type || undefined,
        department: event.department || undefined,
        user_id: event.user_id,
        created_at: event.created_at ? new Date(event.created_at) : undefined,
        updated_at: event.updated_at ? new Date(event.updated_at) : undefined
      }
    }) || []
  },

  async createEvent(session: UserSession, event: Omit<CalendarEvent, 'id'>) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // First create the event
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description || '',
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category || 'default',
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          endDate: event.recurrence.endDate?.toISOString()
        } : null,
        user_id: session.user.id,
        department: event.department || null
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)
      throw eventError
    }

    if (!eventData) {
      throw new Error('Failed to create event')
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

    // Return the complete event
    return {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || '',
      start: new Date(eventData.start_time),
      end: new Date(eventData.end_time),
      category: eventData.category || 'default',
      recurrence: event.recurrence ? {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval || 1,
        endDate: event.recurrence.endDate
      } : undefined,
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined,
      user_id: eventData.user_id,
      created_at: eventData.created_at ? new Date(eventData.created_at) : undefined,
      updated_at: eventData.updated_at ? new Date(eventData.updated_at) : undefined
    }
  },

  async updateEvent(session: UserSession, id: string, event: Partial<CalendarEvent>) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // First update the event
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .update({
        title: event.title,
        description: event.description || '',
        start_time: event.start?.toISOString(),
        end_time: event.end?.toISOString(),
        category: event.category || 'default',
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          endDate: event.recurrence.endDate?.toISOString()
        } : null,
        department: event.department || null
      })
      .eq('id', id)
      .select()
      .single()

    if (eventError) {
      console.error('Event update error:', eventError)
      throw eventError
    }

    if (!eventData) {
      throw new Error('Event not found')
    }

    // Handle assignment
    if (event.assigned_to && event.assigned_to_type) {
      // First delete any existing assignment
      await supabase
        .from('assignments')
        .delete()
        .eq('assignable_id', id)
        .eq('assignable_type', 'calendar_event')

      // Then create the new assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          assignable_id: id,
          assignable_type: 'calendar_event',
          assigned_to: event.assigned_to,
          assigned_to_type: event.assigned_to_type
        })

      if (assignmentError) {
        console.error('Assignment error:', assignmentError)
        throw assignmentError
      }
    } else {
      // Remove assignment if it exists
      await supabase
        .from('assignments')
        .delete()
        .eq('assignable_id', id)
        .eq('assignable_type', 'calendar_event')
    }

    // Return the complete updated event
    return {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || '',
      start: new Date(eventData.start_time),
      end: new Date(eventData.end_time),
      category: eventData.category || 'default',
      recurrence: eventData.recurrence ? {
        frequency: eventData.recurrence.frequency,
        interval: eventData.recurrence.interval || 1,
        endDate: eventData.recurrence.endDate ? new Date(eventData.recurrence.endDate) : undefined
      } : undefined,
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: eventData.department || undefined,
      user_id: eventData.user_id,
      created_at: eventData.created_at ? new Date(eventData.created_at) : undefined,
      updated_at: eventData.updated_at ? new Date(eventData.updated_at) : undefined
    }
  },

  async deleteEvent(session: UserSession, id: string) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    // First delete any assignments
    await supabase
      .from('assignments')
      .delete()
      .eq('assignable_id', id)
      .eq('assignable_type', 'calendar_event')

    // Then delete the event
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Event deletion error:', error)
      throw error
    }
  }
}