"use client"

import { ReactNode } from 'react'
import { motion } from "framer-motion"

interface PageHeaderProps {
  heading: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
}

export function PageHeader({ heading, description, icon, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-2"
      >
        {icon && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-2 rounded-lg bg-primary/10 text-primary"
          >
            {icon}
          </motion.div>
        )}
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold tracking-tight text-white"
        >
          {heading}
        </motion.h1>
      </motion.div>
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-muted-foreground">{description}</p>
        </motion.div>
      )}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}
