import { supabase } from '../client'
import { UserSession } from '@/types/session'

export interface DbUser {
  id: string
  name: string
  email: string
  department?: string
  role?: string
}

export const userService = {
  async getUsers(): Promise<DbUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, department, role')
        .order('name')

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getUsers:', error)
      throw error
    }
  },

  async getCurrentUserDepartment(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('department')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user department:', error)
        throw error
      }

      return data?.department || null
    } catch (error) {
      console.error('Error in getCurrentUserDepartment:', error)
      throw error
    }
  }
} 