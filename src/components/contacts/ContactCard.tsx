'use client'

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
      className="h-full w-[480px] rounded-3xl overflow-hidden"
    >
      <div className="relative h-full bg-[#141414]">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C2333] via-[#141414] to-[#0A0A0A]" />
        
        {/* Subtle overlay gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1C2333]/10 via-[#141414]/30 to-[#0A0A0A]/50" />
        
        {/* Inner shadow at the top */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />
        
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