import { CalendarEvent } from './calendar'
import { Task } from './tasks'

export interface TaskCalendarRelation {
  id: string
  task_id: string
  event_id: string
  relation_type: 'deadline' | 'working_session' | 'review'
  created_at: Date
  created_by: string
}

export interface TaskWithEvents extends Task {
  events: CalendarEvent[]
}

export interface CalendarEventWithTask extends CalendarEvent {
  task?: Task
}

export type ScheduleStatus = 'unscheduled' | 'partially_scheduled' | 'fully_scheduled' 