import { supabase } from '@/lib/supabase/client'
import { Task } from '@/types/tasks'
import { Session } from '@supabase/supabase-js'

export const taskService = {
  async getTasks(session: Session) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
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
      updatedAt: new Date(row.updated_at)
    })) as Task[]
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session: Session) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        assigned_to: task.assignedTo,
        related_event: task.relatedEvent,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      throw error
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as Task
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
        assigned_to: task.assignedTo,
        related_event: task.relatedEvent
      })
      .eq('id', task.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      throw error
    }

    return {
      ...data,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
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