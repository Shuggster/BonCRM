import { supabase } from './supabase'

export async function getUserByEmail(email: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    return { user, error }
  } catch (error) {
    return { user: null, error }
  }
} 