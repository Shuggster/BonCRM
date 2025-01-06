'use server'

import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '../(auth)/lib/auth-options'

// Create a Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUsers() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    // If not admin, return only the current user
    if (session.user.role !== 'admin') {
      return [{
        id: session.user.id,
        name: session.user.name || session.user.email
      }]
    }

    // For admins, get all users
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .order('name')

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data.map(user => ({
      id: user.id,
      name: user.name || user.email
    }))
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return []
  }
} 