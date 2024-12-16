"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ViewType = 'month' | 'week' | 'day'

interface CalendarViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function CalendarViewToggle({ currentView, onViewChange }: CalendarViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "px-3 hover:bg-white/10",
          currentView === 'month' && "bg-white/10"
        )}
        onClick={() => onViewChange('month')}
      >
        Month
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "px-3 hover:bg-white/10",
          currentView === 'week' && "bg-white/10"
        )}
        onClick={() => onViewChange('week')}
      >
        Week
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "px-3 hover:bg-white/10",
          currentView === 'day' && "bg-white/10"
        )}
        onClick={() => onViewChange('day')}
      >
        Day
      </Button>
    </div>
  )
}
