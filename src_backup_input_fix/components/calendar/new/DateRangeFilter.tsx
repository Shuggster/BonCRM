import { Button } from "@/components/ui/button"
import { Calendar, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

export const DATE_RANGES = {
  today: {
    label: 'Today',
    bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  thisWeek: {
    label: 'This Week',
    bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  thisMonth: {
    label: 'This Month',
    bgClass: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  custom: {
    label: 'Custom Range',
    bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }
} as const

export type DateRangeType = keyof typeof DATE_RANGES

interface DateRange {
  start: Date
  end: Date
}

interface DateRangeFilterProps {
  selectedRange: DateRangeType | null
  customDateRange: DateRange | null
  onRangeChange: (range: DateRangeType | null) => void
  onCustomRangeChange: (range: DateRange | null) => void
}

export function DateRangeFilter({ 
  selectedRange, 
  customDateRange,
  onRangeChange,
  onCustomRangeChange 
}: DateRangeFilterProps) {
  const formatDateRange = (range: DateRange) => {
    return `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d')}`
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2",
              "border border-white/[0.08] hover:border-white/[0.15]",
              "bg-[#1a1a1a] hover:bg-[#222]",
              selectedRange && DATE_RANGES[selectedRange].bgClass
            )}
          >
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {Object.entries(DATE_RANGES).map(([range, data]) => (
            <DropdownMenuItem
              key={range}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => {
                if (range === 'custom') {
                  // TODO: Implement custom date range picker
                  const today = new Date()
                  const nextWeek = new Date()
                  nextWeek.setDate(today.getDate() + 7)
                  onCustomRangeChange({ start: today, end: nextWeek })
                }
                onRangeChange(range as DateRangeType)
              }}
            >
              {data.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedRange && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs rounded-full",
          DATE_RANGES[selectedRange].bgClass
        )}>
          {selectedRange === 'custom' && customDateRange
            ? formatDateRange(customDateRange)
            : DATE_RANGES[selectedRange].label}
          <button
            onClick={() => {
              onRangeChange(null)
              if (selectedRange === 'custom') {
                onCustomRangeChange(null)
              }
            }}
            className="ml-1 hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
} 