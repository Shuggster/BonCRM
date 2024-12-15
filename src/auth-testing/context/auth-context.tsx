"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { testSupabase, logSupabaseResponse } from '../utils/supabase-test'

interface AuthState {
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current auth state
    testSupabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      logSupabaseResponse('Initial Session Check', { data: session })
    })

    // Listen for auth changes
    const { data: { subscription } } = testSupabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      logSupabaseResponse('Auth State Change', { data: session })
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const response = await testSupabase.auth.signInWithPassword({ email, password })
      logSupabaseResponse('Sign In', response)
      return response
    },
    signUp: async (email: string, password: string) => {
      const response = await testSupabase.auth.signUp({ email, password })
      logSupabaseResponse('Sign Up', response)
      return response
    },
    signOut: async () => {
      const response = await testSupabase.auth.signOut()
      logSupabaseResponse('Sign Out', response)
      return response
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
