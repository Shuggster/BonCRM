import { supabaseAdmin } from '@/app/(auth)/lib/supabase-admin'
import { UserSession } from '@/types/users'
import { CalendarEvent } from '@/types/calendar'
import { Database } from '@/types/supabase'

type Assignment = Database['public']['Tables']['assignments']['Insert']

interface DatabaseCalendarEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  category: string | null
  recurrence: any
  user_id: string
  created_at: string
  updated_at: string
}

interface DatabaseEventInput {
  title: string
  description?: string | null
  start_time: string
  end_time: string
  category: string | null
  recurrence: any
  user_id: string
  assigned_to?: string | null
  assigned_to_type?: 'user' | 'team' | null
  department?: string | null
}

export const activityCalendarService = {
  async createActivityWithEvent(
    session: UserSession,
    data: {
      title: string
      type: 'call' | 'email' | 'meeting' | 'follow_up'
      description?: string
      contact_id: string
      scheduled_for: Date
      duration_minutes?: number
    }
  ) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    try {
      // First create the activity
      const { data: activity, error: activityError } = await supabaseAdmin
        .from('scheduled_activities')
        .insert({
          user_id: session.user.id,
          contact_id: data.contact_id,
          title: data.title.trim(),
          type: data.type,
          description: data.description?.trim() || null,
          scheduled_for: data.scheduled_for.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (activityError) {
        console.error('Error creating activity:', activityError)
        throw activityError
      }

      // Calculate end time
      const endTime = new Date(data.scheduled_for)
      endTime.setMinutes(endTime.getMinutes() + (data.duration_minutes || 30))

      // Create the calendar event
      const eventInput: DatabaseEventInput = {
        title: data.title,
        description: data.description || null,
        start_time: data.scheduled_for.toISOString(),
        end_time: endTime.toISOString(),
        category: data.type,
        recurrence: null,
        user_id: session.user.id,
        department: session.user.department || null
      }

      console.log('Creating calendar event with input:', eventInput)

      const { data: event, error: eventError } = await supabaseAdmin
        .from('calendar_events')
        .insert(eventInput)
        .select('*')
        .single()

      if (eventError) {
        console.error('Error creating event:', eventError)
        // Rollback activity
        await supabaseAdmin
          .from('scheduled_activities')
          .delete()
          .eq('id', activity.id)
        throw eventError
      }

      console.log('Created calendar event:', event)

      // Create the activity-calendar relation
      const { error: relationError } = await supabaseAdmin
        .from('activity_calendar_relations')
        .insert({
          activity_id: activity.id,
          calendar_event_id: event.id
        })

      if (relationError) {
        console.error('Error creating relation:', relationError)
        // Rollback event and activity
        await supabaseAdmin
          .from('calendar_events')
          .delete()
          .eq('id', event.id)
        await supabaseAdmin
          .from('scheduled_activities')
          .delete()
          .eq('id', activity.id)
        throw relationError
      }

      console.log('Created activity-calendar relation')

      // Create user assignment
      const userAssignment: Assignment = {
        assignable_id: event.id,
        assignable_type: 'calendar_event',
        assigned_to: session.user.id,
        assigned_to_type: 'user'
      }

      console.log('Creating user assignment:', {
        assignment: userAssignment,
        userId: session.user.id,
        eventId: event.id
      })

      // First verify the user exists
      const { data: userExists, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (userCheckError || !userExists) {
        console.error('User validation error:', userCheckError)
        throw new Error('Invalid user for assignment')
      }

      // Then create the assignment
      const { data: assignmentData, error: userAssignmentError } = await supabaseAdmin
        .from('assignments')
        .upsert(userAssignment, {
          onConflict: 'assignable_id,assignable_type,assigned_to,assigned_to_type'
        })
        .select()

      if (userAssignmentError) {
        console.error('Error creating user assignment:', {
          error: userAssignmentError,
          assignment: userAssignment,
          user: session.user
        })
        // Rollback everything
        await supabaseAdmin
          .from('activity_calendar_relations')
          .delete()
          .eq('calendar_event_id', event.id)
        await supabaseAdmin
          .from('calendar_events')
          .delete()
          .eq('id', event.id)
        await supabaseAdmin
          .from('scheduled_activities')
          .delete()
          .eq('id', activity.id)
        throw userAssignmentError
      }

      console.log('Created user assignment:', assignmentData)

      // Convert database event to CalendarEvent type
      const calendarEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        category: event.category || 'default',
        contact_id: data.contact_id,
        assigned_to: event.assigned_to || undefined,
        assigned_to_type: event.assigned_to_type || undefined,
        department: event.department || undefined,
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          endDate: event.recurrence.end_date ? new Date(event.recurrence.end_date) : undefined
        } : undefined,
        isRecurring: Boolean(event.recurrence)
      }

      console.log('Converted to calendar event:', calendarEvent)

      // Dispatch calendar refresh events
      if (typeof window !== 'undefined') {
        // Dispatch both standard and custom events for maximum compatibility
        window.dispatchEvent(new Event('calendar:refresh', { bubbles: true }))
        window.dispatchEvent(new CustomEvent('calendar:refresh', { bubbles: true }))
        // Also dispatch a general refresh event that some components might be listening to
        window.dispatchEvent(new Event('refresh', { bubbles: true }))
        window.dispatchEvent(new CustomEvent('refresh', { bubbles: true }))
      }

      return {
        activity,
        event: calendarEvent
      }
    } catch (error) {
      console.error('Error in createActivityWithEvent:', error)
      throw error
    }
  },

  async getActivitiesWithEvents(session: UserSession) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    try {
      console.log('Getting activities with events for user:', session.user.id)

      const { data: activities, error: activitiesError } = await supabaseAdmin
        .from('scheduled_activities')
        .select('*, activity_calendar_relations!inner(calendar_events(*))')
        .eq('user_id', session.user.id)

      if (activitiesError) {
        console.error('Error getting activities:', activitiesError)
        throw activitiesError
      }

      console.log('Found activities:', activities?.length)
      console.log('Activities with events:', activities)

      return activities.map(activity => ({
        ...activity,
        calendar_event: activity.activity_calendar_relations?.[0]?.calendar_events || null
      }))
    } catch (error) {
      console.error('Error in getActivitiesWithEvents:', error)
      throw error
    }
  },

  async updateActivityStatus(
    session: UserSession,
    activityId: string,
    status: 'completed' | 'cancelled'
  ): Promise<void> {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    try {
      console.log('Updating activity status:', { activityId, status })

      const { error: updateError } = await supabaseAdmin
        .from('scheduled_activities')
        .update({ status })
        .eq('id', activityId)
        .eq('user_id', session.user.id)

      if (updateError) {
        console.error('Error updating activity status:', updateError)
        throw updateError
      }

      // Dispatch calendar refresh event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('calendar:refresh'))
      }
    } catch (error) {
      console.error('Error in updateActivityStatus:', error)
      throw error
    }
  }
} 