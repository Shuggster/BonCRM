import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { TaskActivity } from '@/types/comments'

export const taskActivitiesService = {
  async getActivities(taskId: string, session: Session) {
    const { data, error } = await supabase
      .from('task_activities')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(row => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      actionType: row.action_type,
      previousValue: row.previous_value,
      newValue: row.new_value,
      createdAt: new Date(row.created_at)
    })) as TaskActivity[]
  },
  async logActivity(activity: {
    taskId: string,
    actionType: ActivityType,
    previousValue: any,
    newValue: any
  }, session: Session) {
    const { error } = await supabase
      .from('task_activities')
      .insert({
        task_id: activity.taskId,
        action_type: activity.actionType,
        previous_value: activity.previousValue,
        new_value: activity.newValue,
        user_id: session.user.id
      })

    if (error) throw error
  }
} 