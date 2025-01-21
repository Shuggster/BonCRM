'use client'

import Sidebar from '@/components/layout/Sidebar'
import { SplitViewContainer, SplitViewPersistence } from '@/components/layouts/SplitViewContainer'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants } from '@/lib/animations'

export function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <>
      <div className="flex h-screen bg-black">
        {/* Navigation Column */}
        <Sidebar />
        
        {/* Main Content Column */}
        <div className="flex-1 h-full overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full overflow-auto"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>

        {/* Split View Column - Fixed width, separate from main content */}
        <div className="w-[600px] h-full relative">
          <SplitViewContainer />
          <SplitViewPersistence />
        </div>
      </div>
    </>
  )
} 