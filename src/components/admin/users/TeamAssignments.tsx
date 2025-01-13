"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Team {
  id: string
  name: string
}

interface TeamAssignment {
  team_id: string
  user_id: string
  role: 'leader' | 'member'
}

interface TeamAssignmentsProps {
  userId: string
}

export function TeamAssignments({ userId }: TeamAssignmentsProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeams, setUserTeams] = useState<TeamAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string>("")

  // Load teams and user's team assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all teams
        const teamsResponse = await fetch('/api/teams')
        const teamsData = await teamsResponse.json()
        if (!teamsResponse.ok) throw new Error(teamsData.error)
        setTeams(teamsData.teams)

        // Load user's team assignments
        const userTeamsResponse = await fetch(`/api/users/${userId}/teams`)
        const userTeamsData = await userTeamsResponse.json()
        if (!userTeamsResponse.ok) throw new Error(userTeamsData.error)
        setUserTeams(userTeamsData.teams)
      } catch (error) {
        console.error('Error loading teams:', error)
        toast.error('Failed to load teams')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleAddTeam = async () => {
    if (!selectedTeam) return

    try {
      const response = await fetch(`/api/teams/${selectedTeam}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'member' })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      // Update local state
      setUserTeams([...userTeams, { team_id: selectedTeam, user_id: userId, role: 'member' }])
      setSelectedTeam("")
      toast.success('Team assigned successfully')
    } catch (error) {
      console.error('Error assigning team:', error)
      toast.error('Failed to assign team')
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      // Update local state
      setUserTeams(userTeams.filter(ut => ut.team_id !== teamId))
      toast.success('Team removed successfully')
    } catch (error) {
      console.error('Error removing team:', error)
      toast.error('Failed to remove team')
    }
  }

  const availableTeams = teams.filter(team => 
    !userTeams.some(ut => ut.team_id === team.id)
  )

  if (loading) {
    return <div>Loading team assignments...</div>
  }

  return (
    <div className="space-y-4">
      <Label>Team Assignments</Label>
      
      {/* Current Teams */}
      <div className="space-y-2">
        {userTeams.map((userTeam) => {
          const team = teams.find(t => t.id === userTeam.team_id)
          if (!team) return null
          
          return (
            <div key={team.id} className="flex items-center justify-between p-2 rounded-md bg-[#111111] border border-white/10">
              <span>{team.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTeam(team.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Add Team */}
      {availableTeams.length > 0 && (
        <div className="flex gap-2">
          <Select
            value={selectedTeam}
            onValueChange={setSelectedTeam}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select team to add" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddTeam} disabled={!selectedTeam}>
            Add Team
          </Button>
        </div>
      )}
    </div>
  )
} 