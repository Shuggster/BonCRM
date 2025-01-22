import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.error('Missing Supabase credentials:', { url: !!url, key: !!key })
    throw new Error('Missing Supabase credentials')
  }

  console.log('Initializing Supabase client with URL:', url)
  
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
} 