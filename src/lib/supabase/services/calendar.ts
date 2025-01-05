import { EventCategory } from '@/lib/constants/categories'
import { Session } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/app/(auth)/lib/supabase-admin'
import { CalendarEvent, RecurrenceRule, RecurringEventDeleteOption } from '@/types/calendar'
import { format } from 'date-fns'
import { UserSession } from '@/types/session'
import { Database } from '@/types/supabase'
import { generateRecurringInstances } from '@/lib/utils/recurrence'
import { StatusType } from '@/components/calendar/new/StatusFilter'
import { PriorityType } from '@/components/calendar/new/PriorityFilter'

type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']

export const calendarService = {
  async getEvents(start: Date, end: Date, session: UserSession): Promise<CalendarEvent[]> {
    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session')
    }

    console.log('Fetching events for range:', { start, end })
    try {
      const { data, error } = await supabaseAdmin
        .from('calendar_events')
        .select('*')
        .eq('user_id', session.user.id)
        .or(`and(start_time.gte.${start.toISOString()},start_time.lte.${end.toISOString()}),recurrence.not.is.null`)
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error fetching calendar events:', error)
        throw error
      }

      console.log('Raw events from database:', data)

      const baseEvents = (data || []).map((event: CalendarEventRow) => {
        console.log('Converting event:', event)
        return ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          category: (event.category || 'default') as EventCategory,
          user_id: event.user_id,
          status: event.status as StatusType,
          priority: event.priority as PriorityType,
          type: event.type || 'meeting',
          assigned_to: event.assigned_to || undefined,
          assigned_to_type: (event.assigned_to_type === 'team' ? 'department' : event.assigned_to_type) || undefined,
          department: event.department || undefined,
          location: event.location || undefined,
          recurrence: event.recurrence ? {
            frequency: event.recurrence.frequency,
            interval: event.recurrence.interval || 1,
            endDate: event.recurrence.end_date ? new Date(event.recurrence.end_date) : undefined,
            exception_dates: event.recurrence.exception_dates || []
          } : undefined
        } as CalendarEvent)
      })

      console.log('Converted base events:', baseEvents)

      // Separate recurring and non-recurring events
      const [recurringEvents, nonRecurringEvents] = baseEvents.reduce<[CalendarEvent[], CalendarEvent[]]>(
        (acc, event) => {
          if (event.recurrence) {
            acc[0].push(event)
          } else {
            acc[1].push(event)
          }
          return acc
        },
        [[], []]
      )

      // Generate instances only for recurring events
      const recurringInstances = recurringEvents.flatMap(event => 
        generateRecurringInstances(event, start, end)
      )

      // Combine recurring instances with non-recurring events
      const allEvents = [...nonRecurringEvents, ...recurringInstances]

      console.log('Events with recurrences:', allEvents)
      return allEvents
    } catch (err) {
      console.error('Error in getEvents:', err)
      throw err
    }
  },

  async createEvent(event: Omit<CalendarEvent, 'id'>, session: UserSession): Promise<CalendarEvent> {
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert({
        title: event.title,
        description: event.description || null,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.category || 'default',
        user_id: session.user.id,
        assigned_to: event.assigned_to || null,
        assigned_to_type: event.assigned_to_type || null,
        department: event.department || null,
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          end_date: event.recurrence.endDate?.toISOString(),
          exception_dates: event.recurrence.exception_dates || []
        } : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }

    // Convert the database response to match our CalendarEvent type
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      category: (data.category || 'default') as EventCategory,
      user_id: data.user_id,
      status: 'scheduled' as StatusType, // Default status
      priority: 'medium' as PriorityType, // Default priority
      type: 'meeting', // Default type
      assigned_to: data.assigned_to || undefined,
      assigned_to_type: data.assigned_to_type || undefined,
      department: data.department || undefined,
      recurrence: data.recurrence ? {
        frequency: data.recurrence.frequency,
        interval: data.recurrence.interval || 1,
        endDate: data.recurrence.end_date ? new Date(data.recurrence.end_date) : undefined,
        exception_dates: data.recurrence.exception_dates || []
      } : undefined
    }
  },

  async updateEvent(event: Partial<CalendarEvent>, session: UserSession): Promise<CalendarEvent> {
    try {
      if (!event.id) {
        throw new Error('Event ID is required for update')
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (event.title !== undefined) updateData.title = event.title
      if (event.description !== undefined) updateData.description = event.description
      if (event.start) updateData.start_time = event.start.toISOString()
      if (event.end) updateData.end_time = event.end.toISOString()
      if (event.category) updateData.category = event.category
      if (event.recurring !== undefined) {
        updateData.recurrence = event.recurring && event.recurring.frequency !== 'none' && event.recurring.frequency !== 'yearly' ? {
          frequency: event.recurring.frequency,
          interval: event.recurring.interval || 1,
          end_date: event.recurring.endDate?.toISOString()
        } : null
      }

      const { data, error } = await supabaseAdmin
        .from('calendar_events')
        .update(updateData)
        .eq('id', event.id)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating calendar event:', error)
        throw new Error(error.message)
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        start: new Date(data.start_time),
        end: new Date(data.end_time),
        category: (data.category || 'default') as EventCategory,
        user_id: data.user_id,
        recurring: data.recurrence ? {
          frequency: data.recurrence.frequency,
          interval: data.recurrence.interval || 1,
          endDate: data.recurrence.end_date ? new Date(data.recurrence.end_date) : null,
          weekdays: []
        } : undefined
      }
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw error instanceof Error ? error : new Error('Failed to update calendar event')
    }
  },

  async deleteEvent(
    id: string, 
    session: UserSession, 
    deleteOption?: RecurringEventDeleteOption,
    instanceDate?: Date
  ): Promise<void> {
    // Get the original event ID if this is an instance
    const originalId = id.includes('_') ? id.split('_')[0] : id

    // Get the event to check if it's recurring
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('id', originalId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching event:', fetchError)
      throw fetchError
    }

    // If it's not a recurring event or user chose to delete all, just delete the event
    if (!event.recurrence || deleteOption === 'all') {
      const { error } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('id', originalId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error deleting calendar event:', error)
        throw error
      }
      return
    }

    // Handle single instance deletion
    if (deleteOption === 'single' && instanceDate) {
      const exceptionDates = event.recurrence.exception_dates || []
      const formattedDate = format(instanceDate, 'yyyy-MM-dd')
      
      if (!exceptionDates.includes(formattedDate)) {
        exceptionDates.push(formattedDate)
      }

      const { error } = await supabaseAdmin
        .from('calendar_events')
        .update({
          recurrence: {
            ...event.recurrence,
            exception_dates: exceptionDates
          }
        })
        .eq('id', originalId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error updating event exceptions:', error)
        throw error
      }
      return
    }

    // Handle future instances deletion
    if (deleteOption === 'future' && instanceDate) {
      const { error } = await supabaseAdmin
        .from('calendar_events')
        .update({
          recurrence: {
            ...event.recurrence,
            end_date: format(instanceDate, 'yyyy-MM-dd')
          }
        })
        .eq('id', originalId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error updating event end date:', error)
        throw error
      }
      return
    }

    throw new Error('Invalid delete option or missing instance date')
  },

  async getEventById(id: string, session: UserSession): Promise<CalendarEvent> {
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching calendar event:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      start: new Date(data.start_time),
      end: new Date(data.end_time),
      category: (data.category || 'default') as EventCategory,
      user_id: data.user_id,
      recurring: data.recurrence ? {
        frequency: data.recurrence.frequency,
        interval: data.recurrence.interval || 1,
        endDate: data.recurrence.end_date ? new Date(data.recurrence.end_date) : null,
        weekdays: []
      } : undefined
    }
  }
}