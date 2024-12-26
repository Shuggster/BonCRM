'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface SplitViewProps {
  contentKey: string
  topContent: React.ReactNode
  bottomContent: React.ReactNode
  isVisible?: boolean
}

export function SplitView({ contentKey, topContent, bottomContent, isVisible = true }: SplitViewProps) {
  const splitVariants = {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2
      }
    }
  }

  const topVariants = {
    initial: { y: -40 },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2
      }
    },
    exit: { 
      y: -40,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2
      }
    }
  }

  const bottomVariants = {
    initial: { y: 40 },
    animate: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2,
        delay: 0.1
      }
    },
    exit: { 
      y: 40,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 30,
        mass: 1.2
      }
    }
  }

  return (
    <div className="relative h-full p-6">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={contentKey}
            variants={splitVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative h-full flex flex-col"
          >
            {/* Top Content */}
            <motion.div
              variants={topVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-1/2"
            >
              <div className="relative h-full rounded-t-2xl bg-[#141414] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#141414] to-[#111111]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A]/10 via-[#141414]/30 to-[#111111]/50" />
                <div className="relative h-full z-10">
                  {topContent}
                </div>
              </div>
            </motion.div>

            {/* Bottom Content */}
            <motion.div
              variants={bottomVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-1/2"
            >
              <div className="relative h-full rounded-b-2xl bg-[#141414] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#111111] via-[#141414] to-[#1A1A1A]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A]/10 via-[#141414]/30 to-[#111111]/50" />
                <div className="relative h-full z-10 overflow-y-auto no-scrollbar">
                  {bottomContent}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 