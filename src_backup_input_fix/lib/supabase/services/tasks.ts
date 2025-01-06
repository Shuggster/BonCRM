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
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      assigned_to: row.assigned_to,
      assigned_to_type: row.assigned_to_type,
      department: row.department,
      taskGroupId: row.task_group_id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) as Task[]
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, session: Session) {
    if (!session?.user?.id) {
      throw new Error('No session found')
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.dueDate?.toISOString(),
        task_group_id: task.taskGroupId,
        assigned_to: task.assigned_to,
        assigned_to_type: task.assigned_to_type,
        department: task.department,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('[Tasks Service] Create error:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      assigned_to: data.assigned_to,
      assigned_to_type: data.assigned_to_type,
      department: data.department,
      taskGroupId: data.task_group_id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as Task
  },

  async updateTask(task: Task, session: Session) {
    if (!session?.user?.id) {
      throw new Error('No session found')
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString(),
        task_group_id: task.taskGroupId,
        assigned_to: task.assigned_to,
        assigned_to_type: task.assigned_to_type,
        department: task.department,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .select()
      .single()

    if (error) {
      console.error('[Tasks Service] Update error:', error)
      throw error
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      assigned_to: data.assigned_to,
      assigned_to_type: data.assigned_to_type,
      department: data.department,
      taskGroupId: data.task_group_id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as Task
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
  },

  async searchTasks(query: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('createdAt', { ascending: false })
      .limit(10)

    if (error) throw error
    return data?.map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    })) || []
  }
}