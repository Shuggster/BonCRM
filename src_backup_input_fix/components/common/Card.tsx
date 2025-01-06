'use client'

import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'

interface CardProps {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode[]
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isInteractive?: boolean
}

export function Card({ 
  title, 
  subtitle,
  icon,
  actions = [],
  children,
  className = '',
  onClick,
  isInteractive = true
}: CardProps) {
  const CardComponent = isInteractive ? motion.div : 'div'
  
  return (
    <CardComponent
      className={`
        group bg-white/[0.05] rounded-lg overflow-hidden
        ${isInteractive ? 'hover:bg-white/[0.08] cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={isInteractive ? { scale: 1.01 } : undefined}
      whileTap={isInteractive ? { scale: 0.99 } : undefined}
    >
      {/* Card Header */}
      {(title || subtitle || icon || actions.length > 0) && (
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-medium">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
            </div>
          </div>

          {/* Card Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 pt-2">
        {children}
      </div>
    </CardComponent>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  onClick?: () => void
}

export function StatCard({ title, value, icon, trend, onClick }: StatCardProps) {
  return (
    <Card
      icon={icon}
      onClick={onClick}
      className="min-w-[200px]"
    >
      <div className="space-y-1">
        <div className="text-sm text-zinc-400">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-zinc-400">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  )
} 