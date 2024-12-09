"use client"

import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  icon: LucideIcon
  iconClass: string
}

export function PageHeader({ title, icon: Icon, iconClass }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-2"
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-2 rounded-lg ${iconClass}`}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-muted-foreground">
          Welcome to {title}
        </p>
      </motion.div>
    </div>
  )
}
