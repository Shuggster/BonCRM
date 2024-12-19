"use client"

import { User, Users } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Team {
  id: string
  name: string
}

interface User {
  id: string
  name: string
}

interface TeamSelectProps {
  onSelect: (selection: { type: 'user' | 'team', id: string }) => void
  defaultValue?: { type: 'user' | 'team', id: string }
  multiple?: boolean
  includeTeams?: boolean
}

export function TeamSelect({ 
  onSelect, 
  defaultValue,
  multiple = false,
  includeTeams = true 
}: TeamSelectProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamsAndUsers()
  }, [])

  async function fetchTeamsAndUsers() {
    try {
      setLoading(true)
      setError(null)
      
      const [teamsResponse, usersResponse] = await Promise.all([
        supabase.from('teams').select('id, name'),
        supabase.from('users').select('id, name')
      ])

      if (teamsResponse.error) throw teamsResponse.error
      if (usersResponse.error) throw usersResponse.error

      setTeams(teamsResponse.data || [])
      setUsers(usersResponse.data || [])
    } catch (err) {
      setError('Failed to load teams and users')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Select onValueChange={onSelect} defaultValue={defaultValue?.id}>
      <SelectTrigger>
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent>
        {includeTeams && (
          <SelectGroup>
            <SelectLabel>Teams</SelectLabel>
            {teams.map(team => (
              <SelectItem key={team.id} value={{ type: 'team', id: team.id }}>
                <Users className="mr-2 h-4 w-4" />
                {team.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel>Users</SelectLabel>
          {users.map(user => (
            <SelectItem key={user.id} value={{ type: 'user', id: user.id }}>
              <User className="mr-2 h-4 w-4" />
              {user.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 