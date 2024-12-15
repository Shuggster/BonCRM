import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a separate instance for testing
export const testSupabase = createClientComponentClient()

// Add logging for debugging
export const logSupabaseResponse = (action: string, response: any) => {
  console.log(`Auth Test - ${action}:`, {
    data: response.data,
    error: response.error ? {
      message: response.error.message,
      status: response.error.status,
      details: response.error.details
    } : null
  })
} 