"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

export function useSupabaseSession() {
  const { data: session } = useSession()

  useEffect(() => {
    const syncSupabase = async () => {
      if (session?.user?.email) {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // If no Supabase user exists, sign in with email
          const { data, error } = await supabase.auth.signInWithPassword({
            email: session.user.email,
            password: session.user.email // Using email as password for demo - adjust as needed
          })
          
          if (error) {
            console.error('Error syncing Supabase session:', error)
          }
        }
      }
    }

    syncSupabase()
  }, [session])

  return null
}
