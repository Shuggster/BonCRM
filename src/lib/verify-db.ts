import { supabase } from './supabase'

export async function verifyDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('count')
      .limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    }
  }
}
