import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { TaskComment, TaskActivity, ActivityType } from '@/types/comments'

export const taskCommentsService = {
  async getComments(taskId: string, session: Session) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error.message)
        throw new Error(error.message)
      }

      return (data || []).map(row => ({
        id: row.id,
        taskId: row.task_id,
        userId: row.user_id,
        content: row.content,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      })) as TaskComment[]
    } catch (error) {
      console.error('Error in getComments:', error)
      throw error
    }
  },

  async createComment(comment: { taskId: string, content: string }, session: Session) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: comment.taskId,
          content: comment.content,
          user_id: session.user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating comment:', error.message)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('No data returned from comment creation')
      }

      return {
        id: data.id,
        taskId: data.task_id,
        userId: data.user_id,
        content: data.content,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as TaskComment
    } catch (error) {
      console.error('Error in createComment:', error)
      throw error
    }
  },

  async updateComment(comment: TaskComment, session: Session) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .update({
          content: comment.content
        })
        .eq('id', comment.id)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating comment:', error.message)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('No data returned from comment update')
      }

      return {
        id: data.id,
        taskId: data.task_id,
        userId: data.user_id,
        content: data.content,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as TaskComment
    } catch (error) {
      console.error('Error in updateComment:', error)
      throw error
    }
  },

  async deleteComment(commentId: string, session: Session) {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error deleting comment:', error.message)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in deleteComment:', error)
      throw error
    }
  },

  async getActivities(taskId: string, session: Session) {
    try {
      const { data, error } = await supabase
        .from('task_activities')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching activities:', error.message)
        throw new Error(error.message)
      }

      return (data || []).map(row => ({
        id: row.id,
        taskId: row.task_id,
        userId: row.user_id,
        actionType: row.action_type,
        previousValue: row.previous_value,
        newValue: row.new_value,
        createdAt: new Date(row.created_at)
      }))
    } catch (error) {
      console.error('Error in getActivities:', error)
      throw error
    }
  },

  async logActivity(activity: {
    taskId: string,
    actionType: ActivityType,
    previousValue: any,
    newValue: any
  }, session: Session) {
    try {
      const { error } = await supabase
        .from('task_activities')
        .insert({
          task_id: activity.taskId,
          action_type: activity.actionType,
          previous_value: activity.previousValue,
          new_value: activity.newValue,
          user_id: session.user.id
        })

      if (error) {
        console.error('Error logging activity:', error.message)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in logActivity:', error)
      throw error
    }
  }
} 