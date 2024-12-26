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
      type: "tween",
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.4
    }
  }
}

const bottomVariants = {
  initial: { y: "100%" },
  animate: { 
    y: 0,
    transition: {
      type: "tween",
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.4
    }
  }
}

export function SplitViewContainer() {
  const { isVisible, topContent, bottomContent } = useSplitViewStore()

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          className="absolute inset-0 flex items-center bg-black"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="w-full max-w-[600px] h-[calc(100%-8rem)] mx-auto relative overflow-y-auto">
            <div className="min-h-full">
              {/* Top Card */}
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ 
                  y: 0,
                  transition: {
                    type: "tween",
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.4
                  }
                }}
                className="h-[50%]"
              >
                <div className="rounded-t-2xl bg-[#111111] border border-white/[0.05] border-b-0">
                  <div className="rounded-t-2xl overflow-hidden">
                    {topContent}
                  </div>
                </div>
              </motion.div>

              {/* Bottom Card */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ 
                  y: 0,
                  transition: {
                    type: "tween",
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.4
                  }
                }}
                className="h-[50%]"
              >
                <div className="rounded-b-2xl bg-[#111111] border border-white/[0.05] border-t-0">
                  <div className="rounded-b-2xl overflow-hidden">
                    {bottomContent}
                  </div>
                </div>
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