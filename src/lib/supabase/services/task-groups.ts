import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'

export interface TaskGroup {
  id: string
  name: string
  color: string
  description?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export const taskGroupService = {
  async getGroups(session: Session) {
    const { data, error } = await supabase
      .from('task_groups')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) as TaskGroup[]
  },

  async createGroup(group: { name: string, color: string, description?: string }, session: Session) {
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

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      description: data.description,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskGroup
  },

  async updateGroup(group: TaskGroup, session: Session) {
    const { data, error } = await supabase
      .from('task_groups')
      .update({
        name: group.name,
        color: group.color,
        description: group.description,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', group.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      description: data.description,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskGroup
  },

  async deleteGroup(groupId: string, session: Session) {
    const { error } = await supabase
      .from('task_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', session.user.id)

    if (error) throw error
  }
} 