"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar, LayoutGrid, List } from 'lucide-react'

type ViewType = 'month' | 'week' | 'day'

interface CalendarViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function CalendarViewToggle({ currentView, onViewChange }: CalendarViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[#1C2333] rounded-md border border-white/10 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('month')}
        className={cn(
          "h-7 gap-2 px-2",
          "text-gray-400 hover:text-gray-300",
          "hover:bg-white/5",
          "transition-all duration-200",
          currentView === 'month' && "bg-white/10 text-gray-200"
        )}
      >
        <Calendar className="h-4 w-4" />
        <span className="text-sm">Month</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('week')}
        className={cn(
          "h-7 gap-2 px-2",
          "text-gray-400 hover:text-gray-300",
          "hover:bg-white/5",
          "transition-all duration-200",
          currentView === 'week' && "bg-white/10 text-gray-200"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-sm">Week</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('day')}
        className={cn(
          "h-7 gap-2 px-2",
          "text-gray-400 hover:text-gray-300",
          "hover:bg-white/5",
          "transition-all duration-200",
          currentView === 'day' && "bg-white/10 text-gray-200"
        )}
      >
        <List className="h-4 w-4" />
        <span className="text-sm">Day</span>
      </Button>
    </div>
  )
} 