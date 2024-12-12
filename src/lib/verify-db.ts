import { supabase } from './supabase'

export async function verifyDatabaseConnection() {
  try {
    // First check authentication status
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth error:', authError)
      return { success: false, error: 'Authentication error: ' + authError.message }
    }

    if (!session) {
      console.error('No active session')
      return { success: false, error: 'Not authenticated. Please sign in.' }
    }

    console.log('Authenticated as:', session.user.email)

    // Test the connection by trying to read the industries table
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Database read error:', error)
      return { success: false, error: error.message }
    }

    // Try to insert a test industry
    const { data: insertData, error: insertError } = await supabase
      .from('industries')
      .insert([
        {
          name: 'Test Industry',
          description: 'Test Description'
        }
      ])
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return { success: false, error: insertError.message }
    }

    // If we get here, both read and write operations worked
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
