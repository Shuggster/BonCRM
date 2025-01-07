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
      assigned_to?: string
      assigned_to_type?: 'user' | 'team'
    }
  ) {
    if (!session?.user?.id) {
      throw new Error('No user session found')
    }

    try {
      // First create the activity
      const { data: activity, error: activityError } = await supabaseAdmin
        .from('activities')
        .insert({
          title: data.title,
          type: data.type,
          description: data.description,
          contact_id: data.contact_id,
          scheduled_for: data.scheduled_for.toISOString(),
          duration_minutes: data.duration_minutes || 30,
          status: 'scheduled',
          user_id: session.user.id,
          assigned_to: data.assigned_to || session.user.id,
          assigned_to_type: data.assigned_to_type || 'user'
        })
        .select()
        .single()

      if (activityError) throw activityError

      // Then create the calendar event
      const { data: calendarEvent, error: calendarError } = await supabaseAdmin
        .from('calendar_events')
        .insert({
          title: data.title,
          description: data.description,
          start_time: data.scheduled_for.toISOString(),
          end_time: new Date(data.scheduled_for.getTime() + (data.duration_minutes || 30) * 60000).toISOString(),
          user_id: session.user.id,
          category: data.type,
          assigned_to: data.assigned_to || session.user.id,
          assigned_to_type: data.assigned_to_type || 'user'
        })
        .select()
        .single()

      if (calendarError) throw calendarError

      // Finally create the relation between activity and calendar event
      const { error: relationError } = await supabaseAdmin
        .from('activity_calendar_relations')
        .insert({
          activity_id: activity.id,
          calendar_event_id: calendarEvent.id
        })

      if (relationError) throw relationError

      return activity
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
  },

  async getActivitiesByContactId(contactId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('scheduled_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      return {
        data: data.map(activity => ({
          ...activity,
          calendar_event: null
        })),
        error: null
      }
    } catch (error) {
      console.error('Error in getActivitiesByContactId:', error)
      return { data: null, error }
    }
  }
}