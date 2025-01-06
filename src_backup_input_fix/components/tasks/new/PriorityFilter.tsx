'use client'

import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PriorityFilterProps {
  selectedPriority: 'high' | 'medium' | 'low' | null
  onPriorityChange: (priority: 'high' | 'medium' | 'low' | null) => void
}

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#22c55e'
}

export function PriorityFilter({ selectedPriority, onPriorityChange }: PriorityFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Filter by Priority</div>
          {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
            <DropdownMenuItem
              key={priority}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onPriorityChange(priority as 'high' | 'medium' | 'low')}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="capitalize">{priority}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedPriority && (
        <Button 
          size="sm"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
          onClick={() => onPriorityChange(null)}
        >
          Priority: {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)}
          <X className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
} 