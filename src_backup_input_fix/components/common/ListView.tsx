'use client'

import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'

interface ListItemProps {
  avatar?: React.ReactNode
  title: string
  subtitle?: string
  metadata?: React.ReactNode[]
  actions?: React.ReactNode[]
  isSelected?: boolean
  onClick?: () => void
}

export function ListItem({ 
  avatar, 
  title, 
  subtitle, 
  metadata = [], 
  actions = [],
  isSelected,
  onClick 
}: ListItemProps) {
  return (
    <motion.div
      className={`
        group flex items-center gap-4 p-4 hover:bg-white/[0.02] cursor-pointer
        ${isSelected ? 'bg-white/[0.05]' : ''}
      `}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
      whileTap={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
    >
      {/* Avatar */}
      {avatar && (
        <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-lg">
          {avatar}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{title}</span>
          {metadata.map((item, index) => (
            <span key={index} className="text-sm text-zinc-400 truncate">
              {item}
            </span>
          ))}
        </div>
        {subtitle && (
          <span className="text-sm text-zinc-400 truncate">{subtitle}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {actions.map((action, index) => (
          <div key={index} onClick={e => e.stopPropagation()}>
            {action}
          </div>
        ))}
        <motion.button
          className="p-1 hover:bg-white/[0.05] rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

interface ListViewProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  className?: string
}

export function ListView<T>({ items, renderItem, className = '' }: ListViewProps<T>) {
  return (
    <div className={`divide-y divide-white/[0.08] ${className}`}>
      {items.map((item, index) => (
        <div key={index}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  )
} 