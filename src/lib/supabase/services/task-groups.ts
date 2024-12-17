import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'

export interface TaskGroup {
  id: string
  name: string
  color: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
}

export const taskGroupService = {
  async getGroups(session: Session) {
    const { data, error } = await supabase
      .from('task_groups')
      .select('*')
      .eq('user_id', session.user.id)
      .order('name')

    if (error) {
      console.error('Error fetching task groups:', error)
      throw error
    }

    return data as TaskGroup[]
  },

  async createGroup(group: Omit<TaskGroup, 'id' | 'created_at' | 'updated_at'>, session: Session) {
    const { data, error } = await supabase
      .from('task_groups')
      .insert({
        name: group.name,
        color: group.color,
        description: group.description,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task group:', error)
      throw error
    }

    return data as TaskGroup
  },

  async updateGroup(group: Partial<TaskGroup> & { id: string }, session: Session) {
    const { data, error } = await supabase
      .from('task_groups')
      .update({
        name: group.name,
        color: group.color,
        description: group.description
      })
      .eq('id', group.id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task group:', error)
      throw error
    }

    return data as TaskGroup
  },

  async deleteGroup(id: string, session: Session) {
    // First, remove group from all tasks
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ task_group_id: null })
      .eq('task_group_id', id)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Error removing group from tasks:', updateError)
      throw updateError
    }

    // Then delete the group
    const { error } = await supabase
      .from('task_groups')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting task group:', error)
      throw error
    }
  }
} 