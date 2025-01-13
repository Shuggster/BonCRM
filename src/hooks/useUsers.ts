import { useState, useEffect } from 'react'
import { Database } from '@/types/supabase'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'

interface UserTeam {
  id: string
  name: string
  role: 'leader' | 'member'
}

interface User {
  id: string
  name: string | null
  email: string
  role: 'admin' | 'manager' | 'operational'
  department: string | null
  teams?: UserTeam[]
  is_active: boolean
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  async function loadUsers() {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          department,
          is_active,
          team_members (
            role,
            team:teams (
              id,
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error

      // Transform the data to match our interface
      const transformedUsers = data?.map(user => ({
        ...user,
        teams: user.team_members?.map(tm => ({
          id: tm.team.id,
          name: tm.team.name,
          role: tm.role
        }))
      })) || []

      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadUsers()
  }, [session])

  // Set up realtime subscription
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          loadUsers() // Reload users when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  return { users, isLoading, error, mutate: loadUsers }
}