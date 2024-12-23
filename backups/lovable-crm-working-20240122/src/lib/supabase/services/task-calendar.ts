import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { CalendarEvent } from '@/types/calendar'
import { Task } from '@/types/tasks'
import { createClient } from '@supabase/supabase-js'

export type ScheduleStatus = 'scheduled' | 'unscheduled' | 'partially_scheduled'

export interface TaskWithEvents extends Task {
  events: CalendarEvent[]
}

export interface CalendarEventWithTask extends CalendarEvent {
  task: Task | null
}

interface DatabaseCalendarEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  category: string
  recurrence: any
  assigned_to: string | null
  assigned_to_type: 'user' | 'team' | null
  department: string | null
  user_id: string
  created_at: string
  updated_at: string
}

interface DatabaseEventInput {
  title: string
  description: string | null
  start_time: string | null
  end_time: string | null
  category: string
  recurrence: any
  assigned_to: string | null
  assigned_to_type: 'user' | 'team' | null
  department: string | null
  user_id: string
}

interface TaskCalendarRelation {
  task_id: string
  event_id: string
}

export const taskCalendarService = {
  async getTaskWithEvents(taskId: string): Promise<TaskWithEvents | null> {
    // First get the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError
    if (!task) return null

    // Then get the events
    const events = await this.getEventsForTask(taskId)

    return {
      ...task,
      events
    }
  },

  async getEventWithTask(eventId: string): Promise<CalendarEventWithTask | null> {
    // First get the event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError
    if (!event) return null

    // Then get the relation
    const { data: relation, error: relationError } = await supabase
      .from('task_calendar_relations')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (relationError && relationError.code !== 'PGRST116') throw relationError

    // If no relation exists, return just the event
    if (!relation) {
      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        category: event.category,
        recurrence: event.recurrence,
        assigned_to: event.assigned_to,
        assigned_to_type: event.assigned_to_type,
        department: event.department,
        user_id: event.user_id,
        created_at: new Date(event.created_at || Date.now()),
        updated_at: new Date(event.updated_at || Date.now()),
        task: null
      }
    }

    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', relation.task_id)
      .single()

    if (taskError) throw taskError

    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      category: event.category,
      recurrence: event.recurrence,
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: event.department,
      user_id: event.user_id,
      created_at: new Date(event.created_at || Date.now()),
      updated_at: new Date(event.updated_at || Date.now()),
      task: task || null
    }
  },

  async getEventsForTask(taskId: string): Promise<CalendarEvent[]> {
    // Get all relations for this task
    const { data: relations, error: relationsError } = await supabase
      .from('task_calendar_relations')
      .select('event_id')
      .eq('task_id', taskId)

    if (relationsError) throw relationsError
    if (!relations || relations.length === 0) return []

    // Get all events for these relations
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .in('id', relations.map(r => r.event_id))

    if (eventsError) throw eventsError
    if (!events) return []

    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      category: event.category,
      recurrence: event.recurrence,
      assigned_to: event.assigned_to,
      assigned_to_type: event.assigned_to_type,
      department: event.department,
      user_id: event.user_id,
      created_at: new Date(event.created_at || Date.now()),
      updated_at: new Date(event.updated_at || Date.now())
    }))
  },

  async createEventForTask(
    taskId: string,
    eventData: Partial<CalendarEvent>,
    session: Session
  ): Promise<CalendarEvent> {
    console.log('Session:', {
      accessToken: session.access_token,
      user: session.user.id,
      expires: session.expires_at
    })

    // First create the event using the original supabase client
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: eventData.title || '',
        description: eventData.description || null,
        start_time: eventData.start?.toISOString() || null,
        end_time: eventData.end?.toISOString() || null,
        category: eventData.category || 'task',
        recurrence: eventData.recurrence || null,
        assigned_to: eventData.assigned_to || null,
        assigned_to_type: eventData.assigned_to_type || null,
        department: eventData.department || null,
        user_id: session.user.id
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)
      throw eventError
    }
    if (!event) throw new Error('Failed to create event')

    // Then create the relation using the original supabase client
    const { error: relationError } = await supabase
      .from('task_calendar_relations')
      .insert({
        task_id: taskId,
        event_id: event.id,
        relation_type: 'working_session'
      })

    if (relationError) {
      console.error('Relation creation error:', relationError)
      throw relationError
    }

    // Convert database response to CalendarEvent type
    const dbEvent = event as DatabaseCalendarEvent
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || '',
      start: new Date(dbEvent.start_time),
      end: new Date(dbEvent.end_time),
      category: dbEvent.category,
      recurrence: dbEvent.recurrence,
      assigned_to: dbEvent.assigned_to,
      assigned_to_type: dbEvent.assigned_to_type,
      department: dbEvent.department,
      user_id: dbEvent.user_id,
      created_at: new Date(dbEvent.created_at || Date.now()),
      updated_at: new Date(dbEvent.updated_at || Date.now())
    }
  },

  async updateEventForTask(
    taskId: string,
    eventId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    // First verify the relation exists
    const { data: relation, error: relationError } = await supabase
      .from('task_calendar_relations')
      .select()
      .eq('task_id', taskId)
      .eq('event_id', eventId)
      .single()

    if (relationError) throw relationError
    if (!relation) throw new Error('Event is not linked to this task')

    // Then update the event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .update({
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start?.toISOString(),
        end_time: eventData.end?.toISOString(),
        category: eventData.category,
        recurrence: eventData.recurrence
      })
      .eq('id', eventId)
      .select()
      .single()

    if (eventError) throw eventError
    if (!event) throw new Error('Failed to update event')

    // Convert database response to CalendarEvent type
    const dbEvent = event as DatabaseCalendarEvent
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || '',
      start: new Date(dbEvent.start_time),
      end: new Date(dbEvent.end_time),
      category: dbEvent.category,
      recurrence: dbEvent.recurrence,
      assigned_to: dbEvent.assigned_to,
      assigned_to_type: dbEvent.assigned_to_type,
      department: dbEvent.department,
      user_id: dbEvent.id,
      created_at: new Date(dbEvent.created_at || Date.now()),
      updated_at: new Date(dbEvent.updated_at || Date.now())
    }
  },

  async unlinkEventFromTask(taskId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('task_calendar_relations')
      .delete()
      .eq('task_id', taskId)
      .eq('event_id', eventId)

    if (error) throw error
  },

  async unlinkTaskFromEvent(eventId: string, taskId: string): Promise<void> {
    const { error } = await supabase
      .from('task_calendar_relations')
      .delete()
      .eq('event_id', eventId)
      .eq('task_id', taskId)

    if (error) throw error
  },

  async createTaskEventRelation(data: { taskId: string, eventId: string }, session: Session): Promise<TaskCalendarRelation> {
    const { data: relation, error } = await supabase
      .from('task_calendar_relations')
      .insert({
        task_id: data.taskId,
        event_id: data.eventId,
        relation_type: 'working_session'
      })
      .select()
      .single()

    if (error) throw error
    return {
      ...relation,
      created_at: new Date(relation.created_at)
    }
  },

  async updateTaskScheduleStatus(
    taskId: string,
    status: ScheduleStatus,
    session: Session
  ): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ schedule_status: status })
      .eq('id', taskId)

    if (error) throw error
  },

  async getTasksForEvent(eventId: string): Promise<Task[]> {
    // First get the relation IDs
    const { data: relations, error: relationsError } = await supabase
      .from('task_calendar_relations')
      .select('task_id')
      .eq('event_id', eventId)

    if (relationsError) {
      console.error('Error fetching relations:', relationsError)
      throw relationsError
    }
    if (!relations || relations.length === 0) return []

    // Then get the tasks
    const taskIds = relations.map(r => r.task_id)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('id', taskIds)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }
    if (!tasks) return []

    return tasks
  }
} 