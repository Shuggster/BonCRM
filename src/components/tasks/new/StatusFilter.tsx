'use client'

import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StatusFilterProps {
  selectedStatus: 'todo' | 'in-progress' | 'completed' | null
  onStatusChange: (status: 'todo' | 'in-progress' | 'completed' | null) => void
}

const STATUS_COLORS = {
  todo: '#f97316',
  'in-progress': '#3b82f6',
  completed: '#22c55e'
}

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Filter by Status</div>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <DropdownMenuItem
              key={status}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onStatusChange(status as 'todo' | 'in-progress' | 'completed')}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="capitalize">{status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedStatus && (
        <Button 
          size="sm"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
          onClick={() => onStatusChange(null)}
        >
          Status: {selectedStatus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          <X className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
} 