"use client"

import { Button } from "@/components/ui/button"
import { ViewType } from "@/types/calendar"
import { Calendar, CalendarDays, CalendarRange } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

const views: { type: ViewType; icon: React.ReactNode; label: string }[] = [
  { type: 'month', icon: <Calendar className="h-4 w-4" />, label: 'Month' },
  { type: 'week', icon: <CalendarRange className="h-4 w-4" />, label: 'Week' },
  { type: 'day', icon: <CalendarDays className="h-4 w-4" />, label: 'Day' }
]

export function CalendarViewToggle({ currentView, onViewChange }: CalendarViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
      {views.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(type)}
          className={cn(
            "gap-2",
            currentView === type && "bg-white/10"
          )}
        >
          {icon}
          <span className="hidden md:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}
