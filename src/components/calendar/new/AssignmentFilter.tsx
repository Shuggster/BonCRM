import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUsers } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"

interface AssignmentFilterProps {
  selectedAssignee: string | null
  onAssigneeChange: (assignee: string | null) => void
}

export function AssignmentFilter({ selectedAssignee, onAssigneeChange }: AssignmentFilterProps) {
  const { users, isLoading } = useUsers()

  if (isLoading) {
    return <Skeleton className="h-9 w-[150px] rounded-full" />
  }

  const selectedUser = users.find(user => user.id === selectedAssignee)

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
              selectedAssignee && "bg-purple-500/20 text-purple-400 border-purple-500/30"
            )}
          >
            <Filter className="w-4 h-4" />
            Assigned To
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-black border border-white/10">
          {users.map((user) => (
            <DropdownMenuItem
              key={user.id}
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => onAssigneeChange(user.id)}
            >
              {user.name || user.email}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAssignee && selectedUser && (
        <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {selectedUser.name || selectedUser.email}
          <button
            onClick={() => onAssigneeChange(null)}
            className="ml-1 hover:opacity-80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
} 