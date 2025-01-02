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
    <div className="flex items-center gap-1 bg-[#111111] rounded-lg border border-white/10 p-1">
      {views.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(type)}
          className={cn(
            "gap-2 px-3 h-8",
            "text-white/70 hover:text-white",
            "hover:bg-white/[0.02]",
            "transition-all duration-200",
            currentView === type && "bg-white/10 text-white"
          )}
        >
          {icon}
          <span>{label}</span>
        </Button>
      ))}
    </div>
  )
}
