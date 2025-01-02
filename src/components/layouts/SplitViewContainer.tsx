'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { create } from 'zustand'
import { splitContainerVariants, splitContentVariants } from '@/lib/animations'

interface SplitViewState {
  isVisible: boolean
  topContent: React.ReactNode | null
  bottomContent: React.ReactNode | null
  selectedId: string | null
  provider: React.ReactNode | null
  setContentAndShow: (top: React.ReactNode | null, bottom: React.ReactNode | null, id?: string | null, provider?: React.ReactNode | null) => void
  hide: () => void
  reset: () => void
}

export const useSplitViewStore = create<SplitViewState>((set) => ({
  isVisible: false,
  topContent: null,
  bottomContent: null,
  selectedId: null,
  provider: null,
  setContentAndShow: (top, bottom, id = null, provider = null) => set({
    isVisible: true,
    topContent: top,
    bottomContent: bottom,
    selectedId: id,
    provider
  }),
  hide: () => set({ isVisible: false }),
  reset: () => set({
    isVisible: false,
    topContent: null,
    bottomContent: null,
    selectedId: null,
    provider: null
  })
}))

export function SplitViewContainer() {
  const { isVisible, topContent, bottomContent, selectedId, provider } = useSplitViewStore()

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          key={selectedId || 'container'}
          className="fixed right-0 top-0 bottom-0 w-[600px] flex items-center bg-black/80 pointer-events-auto"
          variants={splitContainerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="w-full h-[calc(100%-8rem)] relative overflow-y-auto pointer-events-auto">
            {provider}
            <div className="min-h-full pointer-events-auto">
              {/* Top Card */}
              <motion.div
                variants={splitContentVariants.top}
                initial="initial"
                animate="animate"
                className="h-[50%] pointer-events-auto"
              >
                {topContent}
              </motion.div>

              {/* Bottom Card */}
              <motion.div
                variants={splitContentVariants.bottom}
                initial="initial"
                animate="animate"
                className="h-[50%] pointer-events-auto"
              >
                {bottomContent}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add this component to handle persistence
export function SplitViewPersistence() {
  const { setContentAndShow } = useSplitViewStore()
  
  useEffect(() => {
    const persistedState = localStorage.getItem('splitViewState')
    if (persistedState) {
      const { isVisible, selectedId } = JSON.parse(persistedState)
      if (isVisible) {
        setContentAndShow(null, null, selectedId)
      }
    }
  }, [setContentAndShow])

  return null
} 