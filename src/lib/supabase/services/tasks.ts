import { supabase } from '../client'
import { Task } from '@/types/tasks'
import { Session } from 'next-auth'

export const taskService = {
  async getTasks() {
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

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Tasks Service] Create error:', error)
      throw new Error(error.error || 'Failed to create task')
    }

    return await response.json() as Task
  },

  async updateTask(task: Task, session: Session) {
    console.log('[Tasks Service] Updating task:', {
      task,
      sessionUserId: session?.user?.id
    })

    if (!session?.user?.id) {
      throw new Error('No session found')
    }

    const response = await fetch(`/api/tasks?id=${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Tasks Service] Update error:', error)
      throw new Error(error.error || 'Failed to update task')
    }

    return await response.json() as Task
  },

  async deleteTask(id: string, session: Session) {
    if (!session?.user?.id) {
      throw new Error('No session found')
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}