import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { UserSession } from '@/types/users'

export function useSupabaseSession() {
  const { data: nextAuthSession } = useSession()
  const [session, setSession] = useState<UserSession | null>(null)

  useEffect(() => {
    let isMounted = true

    if (!nextAuthSession?.user?.email) {
      setSession(null)
      return
    }

    const syncSession = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', nextAuthSession.user.email)
          .single()

        if (userError || !userData) {
          if (isMounted) {
            setSession(null)
          }
          return
        }

        if (isMounted) {
          setSession({
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              department: userData.department
            }
          })
        }
      } catch (error) {
        console.error('Error syncing session:', error)
        if (isMounted) {
          setSession(null)
        }
      }
    }

    syncSession()

    return () => {
      isMounted = false
    }
  }, [nextAuthSession?.user?.email])

  return { session }
} 