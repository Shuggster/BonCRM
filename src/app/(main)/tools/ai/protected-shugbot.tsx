'use client'

import { useSession } from 'next-auth/react'
import { ShugbotButton } from '@/components/ai/shugbot-button'

export function ProtectedShugbot() {
  const { data: session, status } = useSession()

  // Don't render anything if not authenticated
  if (status !== 'authenticated' || !session?.user) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <ShugbotButton />
    </div>
  )
} 