import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'

export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  actionType: 
    | 'status_change' 
    | 'priority_change' 
    | 'title_change' 
    | 'description_change' 
    | 'due_date_change' 
    | 'group_change' 
    | 'department_change' 
    | 'assigned_to_change'
    | 'calendar_event_create'
    | 'calendar_event_update'
    | 'calendar_event_delete'
  previousValue: any
  newValue: any
  createdAt: Date
}

export const taskActivitiesService = {
  async getActivities(taskId: string, session: Session) {
    const { data, error } = await supabase
      .from('task_activities')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching activities:', error)
      throw error
    }

    return data?.map(row => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.id,
      actionType: row.action_type,
      previousValue: row.previous_value,
      newValue: row.new_value,
      createdAt: new Date(row.created_at)
    })) || []
  },

  async logActivity(activity: {
    taskId: string
    actionType: TaskActivity['actionType']
    previousValue: any
    newValue: any
  }, session: Session) {
    const { error } = await supabase
      .from('task_activities')
      .insert({
        id: crypto.randomUUID(),
        task_id: activity.taskId,
        action_type: activity.actionType,
        previous_value: activity.previousValue,
        new_value: activity.newValue,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging activity:', error)
      throw error
    }
  }
} 