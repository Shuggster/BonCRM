'use client'

import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSplitViewStore } from './SplitViewContainer'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reset = useSplitViewStore(state => state.reset)

  useEffect(() => {
    reset()
  }, [pathname, reset])

  return (
    <Providers>
      <div className="fixed inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <div key={pathname}>
            {children}
          </div>
        </AnimatePresence>
      </div>
      <Toaster richColors />
    </Providers>
  )
} 