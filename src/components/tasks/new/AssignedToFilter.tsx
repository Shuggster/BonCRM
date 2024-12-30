'use client'

import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type AssignedToOption = 'me' | 'unassigned' | string // string for specific user IDs

interface AssignedToFilterProps {
  selectedAssignedTo: AssignedToOption | null
  onAssignedToChange: (assignedTo: AssignedToOption | null) => void
  currentUserId: string
  users?: Array<{ id: string; name: string }>
}

export function AssignedToFilter({ 
  selectedAssignedTo, 
  onAssignedToChange,
  currentUserId,
  users = []
}: AssignedToFilterProps) {
  const getDisplayText = () => {
    if (!selectedAssignedTo) return null
    if (selectedAssignedTo === 'me') return 'Assigned to Me'
    if (selectedAssignedTo === 'unassigned') return 'Unassigned'
    const user = users.find(u => u.id === selectedAssignedTo)
    return user ? `Assigned to ${user.name}` : null
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Assigned To
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          <div className="px-2 py-1.5 text-xs font-medium text-white/50">Filter by Assignment</div>
          <DropdownMenuItem
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onAssignedToChange('me')}
          >
            Assigned to Me
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onAssignedToChange('unassigned')}
          >
            Unassigned
          </DropdownMenuItem>
          {users.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-medium text-white/50">Team Members</div>
              {users.map(user => (
                <DropdownMenuItem
                  key={user.id}
                  className="text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => onAssignedToChange(user.id)}
                >
                  {user.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAssignedTo && (
        <Button 
          size="sm"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400 hover:border-blue-500/30"
          onClick={() => onAssignedToChange(null)}
        >
          {getDisplayText()}
          <X className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
} 