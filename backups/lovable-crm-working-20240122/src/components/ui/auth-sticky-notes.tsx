"use client"

import { useAuth } from '@/contexts/auth-context'
import dynamic from 'next/dynamic'

const StickyNotes = dynamic(() => import('./sticky-note'), {
  ssr: false
})

export default function AuthStickyNotes() {
  const { session } = useAuth()

  if (!session) {
    return null
  }

  return <StickyNotes />
} 