import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface MetricCardProps {
  title: string
  value: number
  total: number
  icon: ReactNode
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  total,
  icon,
  onClick
}: MetricCardProps) {
  return (
    <Card 
      className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="ml-2 text-sm text-zinc-400">/ {total}</p>
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  )
} 