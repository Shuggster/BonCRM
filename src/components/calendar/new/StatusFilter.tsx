import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const EVENT_STATUSES = {
  scheduled: {
    label: 'Scheduled',
    bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  inProgress: {
    label: 'In Progress',
    bgClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
} as const

export type StatusType = keyof typeof EVENT_STATUSES

interface StatusFilterProps {
  selectedStatus: StatusType | null
  onStatusChange: (status: StatusType | null) => void
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
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
              selectedStatus && EVENT_STATUSES[selectedStatus].bgClass
            )}
          >
            <Filter className="w-4 h-4" />
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {Object.entries(EVENT_STATUSES).map(([status, data]) => (
            <DropdownMenuItem
              key={status}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onStatusChange(status as StatusType)}
            >
              {data.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedStatus && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs rounded-full",
          EVENT_STATUSES[selectedStatus].bgClass
        )}>
          {EVENT_STATUSES[selectedStatus].label}
          <button
            onClick={() => onStatusChange(null)}
            className="ml-1 hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
} 