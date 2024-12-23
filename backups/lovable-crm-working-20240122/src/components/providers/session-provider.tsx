"use client"

import { useSupabaseSession } from '@/hooks/useSupabaseSession'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useSupabaseSession()
  return <>{children}</>
}
