import { supabase } from '../client'
import { Task } from '@/types/tasks'
import { Session } from '@supabase/supabase-js'

export const taskService = {
  async getTasks(session: Session) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_groups (
          id,
          name,
          color
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }

    return data?.map(row => ({
      ...row,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      taskGroupId: row.task_group_id
    })) as Task[]
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session: Session) {
    console.log('[Tasks Service] Creating task:', {
      task,
      sessionUserId: session?.user?.id
    })

    if (!session?.user?.id) {
      throw new Error('No session found')
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate?.toISOString(),
          task_group_id: task.taskGroupId,
          user_id: session.user.id
        })
        .select(`
          *,
          task_groups (
            id,
            name,
            color
          )
        `)
        .single()

      if (error) {
        console.error('[Tasks Service] Create error:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details
        })
        throw error
      }

      return {
        ...data,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        taskGroupId: data.task_group_id
      } as Task
    } catch (err) {
      console.error('[Tasks Service] Unexpected error:', err)
      throw err
    }
  },

  async updateTask(task: Task, session: Session) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        task_group_id: task.taskGroupId
      })
      .eq('id', task.id)
      .eq('user_id', session.user.id)
      .select(`
        *,
        task_groups (
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error('Error updating task:', error)
      throw error
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      taskGroupId: data.task_group_id
    } as Task
  },

  async deleteTask(id: string, session: Session) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }
}