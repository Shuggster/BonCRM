import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { CalendarEvent } from '@/types/calendar'
import { Task } from '@/types/tasks'

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
  created_at: Date
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
        category: event.category || 'default',
        recurrence: event.recurrence ? {
          frequency: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
          endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
        } : undefined,
        assigned_to: event.assigned_to || undefined,
        assigned_to_type: event.assigned_to_type || undefined,
        department: event.department || undefined,
        user_id: event.user_id,
        created_at: event.created_at ? new Date(event.created_at) : undefined,
        updated_at: event.updated_at ? new Date(event.updated_at) : undefined,
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
      category: event.category || 'default',
      recurrence: event.recurrence ? {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval || 1,
        endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
      } : undefined,
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined,
      user_id: event.user_id,
      created_at: event.created_at ? new Date(event.created_at) : undefined,
      updated_at: event.updated_at ? new Date(event.updated_at) : undefined,
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
      category: event.category || 'default',
      recurrence: event.recurrence ? {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval || 1,
        endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
      } : undefined,
      assigned_to: event.assigned_to || undefined,
      assigned_to_type: event.assigned_to_type || undefined,
      department: event.department || undefined,
      user_id: event.user_id,
      created_at: event.created_at ? new Date(event.created_at) : undefined,
      updated_at: event.updated_at ? new Date(event.updated_at) : undefined
    }))
  },

  async createEventForTask(
    taskId: string,
    eventData: Partial<CalendarEvent>,
    session: Session
  ): Promise<CalendarEvent> {
    // First create the event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: eventData.title || '',
        description: eventData.description || '',
        start_time: eventData.start?.toISOString() || null,
        end_time: eventData.end?.toISOString() || null,
        category: eventData.category || 'task',
        recurrence: eventData.recurrence ? {
          frequency: eventData.recurrence.frequency,
          interval: eventData.recurrence.interval || 1,
          endDate: eventData.recurrence.endDate?.toISOString()
        } : null,
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

    // Then create the relation
    const { error: relationError } = await supabase
      .from('task_calendar_relations')
      .insert({
        task_id: taskId,
        event_id: event.id,
        relation_type: 'working_session'
      })

    if (relationError) {
      console.error('Relation creation error:', relationError)
      // Clean up the event since relation failed
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id)
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
      category: dbEvent.category || 'default',
      recurrence: dbEvent.recurrence ? {
        frequency: dbEvent.recurrence.frequency,
        interval: dbEvent.recurrence.interval || 1,
        endDate: dbEvent.recurrence.endDate ? new Date(dbEvent.recurrence.endDate) : undefined
      } : undefined,
      assigned_to: dbEvent.assigned_to || undefined,
      assigned_to_type: dbEvent.assigned_to_type || undefined,
      department: dbEvent.department || undefined,
      user_id: dbEvent.user_id,
      created_at: dbEvent.created_at ? new Date(dbEvent.created_at) : undefined,
      updated_at: dbEvent.updated_at ? new Date(dbEvent.updated_at) : undefined
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
        description: eventData.description || '',
        start_time: eventData.start?.toISOString(),
        end_time: eventData.end?.toISOString(),
        category: eventData.category || 'default',
        recurrence: eventData.recurrence ? {
          frequency: eventData.recurrence.frequency,
          interval: eventData.recurrence.interval || 1,
          endDate: eventData.recurrence.endDate?.toISOString()
        } : null,
        assigned_to: eventData.assigned_to || null,
        assigned_to_type: eventData.assigned_to_type || null,
        department: eventData.department || null
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
      category: dbEvent.category || 'default',
      recurrence: dbEvent.recurrence ? {
        frequency: dbEvent.recurrence.frequency,
        interval: dbEvent.recurrence.interval || 1,
        endDate: dbEvent.recurrence.endDate ? new Date(dbEvent.recurrence.endDate) : undefined
      } : undefined,
      assigned_to: dbEvent.assigned_to || undefined,
      assigned_to_type: dbEvent.assigned_to_type || undefined,
      department: dbEvent.department || undefined,
      user_id: dbEvent.user_id,
      created_at: dbEvent.created_at ? new Date(dbEvent.created_at) : undefined,
      updated_at: dbEvent.updated_at ? new Date(dbEvent.updated_at) : undefined
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
    if (!relation) throw new Error('Failed to create task-event relation')

    return {
      task_id: relation.task_id,
      event_id: relation.event_id,
      created_at: new Date(relation.created_at)
    }
  },

  async updateTaskScheduleStatus(
    taskId: string,
    status: 'unscheduled' | 'scheduled' | 'partially_scheduled',
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