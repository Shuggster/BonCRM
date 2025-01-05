import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const EVENT_PRIORITIES = {
  high: {
    label: 'High Priority',
    bgClass: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  medium: {
    label: 'Medium Priority',
    bgClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  low: {
    label: 'Low Priority',
    bgClass: 'bg-green-500/20 text-green-400 border-green-500/30'
  }
} as const

export type PriorityType = keyof typeof EVENT_PRIORITIES

interface PriorityFilterProps {
  selectedPriority: PriorityType | null
  onPriorityChange: (priority: PriorityType | null) => void
}

export function PriorityFilter({ selectedPriority, onPriorityChange }: PriorityFilterProps) {
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
              selectedPriority && EVENT_PRIORITIES[selectedPriority].bgClass
            )}
          >
            <Filter className="w-4 h-4" />
            Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {Object.entries(EVENT_PRIORITIES).map(([priority, data]) => (
            <DropdownMenuItem
              key={priority}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onPriorityChange(priority as PriorityType)}
            >
              {data.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedPriority && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs rounded-full",
          EVENT_PRIORITIES[selectedPriority].bgClass
        )}>
          {EVENT_PRIORITIES[selectedPriority].label}
          <button
            onClick={() => onPriorityChange(null)}
            className="ml-1 hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
} 