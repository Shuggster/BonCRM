'use client'

import { SessionProvider } from 'next-auth/react'
import { ContactFormProvider } from './contacts/ContactFormContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ContactFormProvider>
        {children}
      </ContactFormProvider>
    </SessionProvider>
  )
}
