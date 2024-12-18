import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { TaskComment } from '@/types/comments'

export const taskCommentsService = {
  async getComments(taskId: string, session: Session) {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return data?.map(row => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) as TaskComment[]
  },

  async createComment(comment: { taskId: string, content: string }, session: Session) {
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: comment.taskId,
        content: comment.content,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      taskId: data.task_id,
      userId: data.user_id,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskComment
  },

  async updateComment(comment: TaskComment, session: Session) {
    const { data, error } = await supabase
      .from('task_comments')
      .update({
        content: comment.content
      })
      .eq('id', comment.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      taskId: data.task_id,
      userId: data.user_id,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskComment
  },

  async deleteComment(commentId: string, session: Session) {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', session.user.id)

    if (error) throw error
  }
} 