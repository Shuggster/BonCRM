"use client"

import { cn } from '@/lib/utils'
import { UserSession } from '@/types/users'
import { useState, useEffect } from 'react'
import { calendarService } from '@/lib/supabase/services/calendar'
import { toast } from 'sonner'

interface AssignmentFilterProps {
  selectedAssignments: string[]
  onChange: (assignments: string[]) => void
  session: UserSession
}

export function AssignmentFilter({ selectedAssignments = [], onChange, session }: AssignmentFilterProps) {
  const [users, setUsers] = useState<Array<{ id: string, name: string }>>([])
  const [teams, setTeams] = useState<Array<{ id: string, name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch users and teams
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        setIsLoading(true)
        const [fetchedUsers, fetchedTeams] = await Promise.all([
          calendarService.getUsers(session),
          calendarService.getTeams(session)
        ])
        setUsers(fetchedUsers)
        setTeams(fetchedTeams)
      } catch (error) {
        console.error('Error fetching assignees:', error)
        toast.error('Failed to load assignees')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAssignees()
  }, [session])

  // Initialize with current user selected if no assignments are selected
  useEffect(() => {
    if (selectedAssignments.length === 0 && !isLoading && users.length > 0) {
      // Select current user's ID by default
      const currentUserId = session?.user?.id
      if (currentUserId) {
        onChange([currentUserId])
      }
    }
  }, [selectedAssignments, users, isLoading, session, onChange])

  const toggleAssignment = (id: string) => {
    if (selectedAssignments.includes(id)) {
      // Don't allow deselecting if it's the only selection
      if (selectedAssignments.length === 1) {
        return
      }
      onChange(selectedAssignments.filter(a => a !== id))
    } else {
      onChange([...selectedAssignments, id])
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Assignments</h3>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Assignments</h3>
      
      {/* Users */}
      {users.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs text-muted-foreground">Users</h4>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleAssignment(user.id)}
              className={cn(
                "flex items-center w-full gap-2 px-2 py-1.5 text-sm",
                "transition-colors duration-200",
                selectedAssignments.includes(user.id) 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                selectedAssignments.includes(user.id) 
                  ? "bg-blue-500" 
                  : "bg-gray-400"
              )} />
              <span>{user.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Teams */}
      {teams.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs text-muted-foreground">Teams</h4>
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => toggleAssignment(team.id)}
              className={cn(
                "flex items-center w-full gap-2 px-2 py-1.5 text-sm",
                "transition-colors duration-200",
                selectedAssignments.includes(team.id) 
                  ? "bg-purple-500/20 text-purple-400" 
                  : "hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                selectedAssignments.includes(team.id) 
                  ? "bg-purple-500" 
                  : "bg-gray-400"
              )} />
              <span>{team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 