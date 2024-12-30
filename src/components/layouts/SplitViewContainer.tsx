'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { create } from 'zustand'

interface SplitViewState {
  isVisible: boolean
  topContent: React.ReactNode | null
  bottomContent: React.ReactNode | null
  selectedId: string | null
  setContent: (top: React.ReactNode | null, bottom: React.ReactNode | null, id?: string | null) => void
  show: () => void
  hide: () => void
  reset: () => void
}

export const useSplitViewStore = create<SplitViewState>((set) => ({
  isVisible: false,
  topContent: null,
  bottomContent: null,
  selectedId: null,
  setContent: (top, bottom, id) => {
    set({ topContent: top, bottomContent: bottom, selectedId: id })
    if (typeof window !== 'undefined') {
      localStorage.setItem('splitViewState', JSON.stringify({ 
        isVisible: true,
        selectedId: id
      }))
    }
  },
  show: () => {
    set({ isVisible: true })
    if (typeof window !== 'undefined') {
      const state = localStorage.getItem('splitViewState')
      if (state) {
        const parsed = JSON.parse(state)
        localStorage.setItem('splitViewState', JSON.stringify({ ...parsed, isVisible: true }))
      }
    }
  },
  hide: () => {
    set({ isVisible: false })
    if (typeof window !== 'undefined') {
      const state = localStorage.getItem('splitViewState')
      if (state) {
        const parsed = JSON.parse(state)
        localStorage.setItem('splitViewState', JSON.stringify({ ...parsed, isVisible: false }))
      }
    }
  },
  reset: () => {
    set({ isVisible: false, topContent: null, bottomContent: null, selectedId: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('splitViewState')
    }
  }
}))

// Main container animation - syncs with page transition
const containerVariants = {
  initial: { x: "100%" },
  animate: { 
    x: 0,
    transition: {
      type: "tween",
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    x: "100%",
    transition: {
      type: "tween",
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Split view animations
const topVariants = {
  initial: { y: "-100%" },
  animate: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 15
    }
  }
}

const bottomVariants = {
  initial: { y: "100%" },
  animate: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 15
    }
  }
}

export function SplitViewContainer() {
  const { isVisible, topContent, bottomContent, selectedId } = useSplitViewStore()

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          key={selectedId || 'container'}
          className="fixed right-0 top-0 bottom-0 w-[600px] flex items-center bg-black/80 pointer-events-auto"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="w-full h-[calc(100%-8rem)] relative overflow-y-auto pointer-events-auto">
            <div className="min-h-full pointer-events-auto">
              {/* Top Card */}
              <motion.div
                variants={topVariants}
                initial="initial"
                animate="animate"
                className="h-[50%] pointer-events-auto"
              >
                {topContent}
              </motion.div>

              {/* Bottom Card */}
              <motion.div
                variants={bottomVariants}
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
  const { setContent, show } = useSplitViewStore()
  
  useEffect(() => {
    const persistedState = localStorage.getItem('splitViewState')
    if (persistedState) {
      const { isVisible, selectedId } = JSON.parse(persistedState)
      if (isVisible) {
        show()
      }
    }
  }, [show])

  return null
} 