import { useState, useEffect } from 'react'
import { Database } from '@/lib/database.types'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  name: string | null
  email: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function loadUsers() {
      if (!session) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name')
        
        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [session])

  return { users, isLoading }
}