"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"

interface MiniCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const WEEKDAYS = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' }
] as const

export function MiniCalendar({ selectedDate, onDateSelect }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

  const getDaysInMonth = (date: Date) => {
    const start = startOfWeek(startOfMonth(date))
    const end = endOfWeek(endOfMonth(date))
    return eachDayOfInterval({ start, end })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="hover:bg-white/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(({ key, label }) => (
          <div key={key} className="text-xs text-muted-foreground">
            {label}
          </div>
        ))}
        {days.map((day) => (
          <Button
            key={day.toString()}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 hover:bg-white/10",
              !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
              isSameDay(day, selectedDate) && "bg-purple-500/20 text-purple-500",
              isSameDay(day, new Date()) && "ring-1 ring-purple-500/20"
            )}
            onClick={() => onDateSelect(day)}
          >
            {format(day, 'd')}
          </Button>
        ))}
      </div>
    </div>
  )
} 