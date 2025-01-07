'use client'

import { Card } from "@/components/ui/card"
import { motion } from 'framer-motion'

interface ContactCardProps {
  isVisible?: boolean
  children: React.ReactNode
}

export function ContactCard({ isVisible = true, children }: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full w-[480px] rounded-3xl overflow-hidden bg-card"
    >
      <div className="relative h-full">
        {/* Content container */}
        <div className="relative h-full z-10 overflow-y-auto no-scrollbar">
          <div className="min-h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 