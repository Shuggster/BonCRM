import { supabase } from '../client'
import { Session } from '@supabase/supabase-js'
import { TaskFilters } from '@/components/tasks/advanced-filters'

export interface TaskFilterPreset {
  id: string
  userId: string
  name: string
  filters: TaskFilters
  createdAt: Date
  updatedAt: Date
}

export const taskFilterPresetService = {
  async getPresets(session: Session): Promise<TaskFilterPreset[]> {
    try {
      if (!session?.user?.id) {
        console.error('No user ID in session:', session)
        throw new Error('No user ID found')
      }

      console.log('Fetching presets for user:', session.user.id)
      
      const { data, error, status, statusText } = await supabase
        .from('task_filter_presets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      console.log('Supabase response:', { data, error, status, statusText })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      if (!data) {
        console.log('No presets found')
        return []
      }

      console.log('Found presets:', data)

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        filters: row.filters,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }))
    } catch (error: any) {
      console.error('Error in getPresets:', {
        error,
        message: error.message,
        stack: error.stack
      })
      throw error
    }
  },

  async createPreset(preset: Omit<TaskFilterPreset, 'id' | 'createdAt' | 'updatedAt'>, session: Session) {
    const { data, error } = await supabase
      .from('task_filter_presets')
      .insert({
        name: preset.name,
        filters: preset.filters,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      filters: data.filters,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as TaskFilterPreset
  },

  async deletePreset(presetId: string, session: Session) {
    const { error } = await supabase
      .from('task_filter_presets')
      .delete()
      .eq('id', presetId)
      .eq('user_id', session.user.id)

    if (error) throw error
  }
}
