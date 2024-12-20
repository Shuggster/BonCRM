"use client"

import { Users } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
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
  includeTeams?: boolean
  disabled?: boolean
}

export function TeamSelect({ 
  onSelect, 
  defaultValue,
  includeTeams = true,
  disabled = false
}: TeamSelectProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userMap = useRef(new Map<string, string>());

  useEffect(() => {
    fetchTeamsAndUsers()
  }, [])

  async function fetchTeamsAndUsers() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching users and teams...');
      
      const [teamsResponse, usersResponse] = await Promise.all([
        supabase.from('teams')
          .select('id, name'),
        supabase.from('users')
          .select('id, name')
      ])

      console.log('Raw User Response:', usersResponse.data);
      console.log('Raw Team Response:', teamsResponse.data);

      if (teamsResponse.error) throw teamsResponse.error
      if (usersResponse.error) throw usersResponse.error

      setTeams(teamsResponse.data || [])
      setUsers(usersResponse.data || [])

      if (usersResponse.data) {
        usersResponse.data.forEach(user => {
          userMap.current.set(user.id.substring(0, 8), user.id);
        });
      }
      if (teamsResponse.data) {
        teamsResponse.data.forEach(team => {
          userMap.current.set(team.id.substring(0, 8), team.id);
        });
      }
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
    <Select 
      onValueChange={(value) => {
        const [type, shortId] = value.split('-');
        const fullId = userMap.current.get(shortId) || shortId;
        onSelect({ 
          type: type as 'user' | 'team', 
          id: fullId
        });
      }}
      defaultValue={defaultValue ? `${defaultValue.type}-${defaultValue.id}` : undefined}
      disabled={disabled}
      className="w-full"
    >
      <SelectTrigger className="w-full bg-[#1C2333] border-white/10 focus:border-blue-500 h-10">
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent 
        className="bg-[#0F1629] border-white/10 max-h-[300px]"
        position="popper"
      >
        {includeTeams && (
          <>
            <SelectGroup>
              <SelectLabel className="text-blue-400 sticky top-0 bg-[#0F1629] z-10">Teams</SelectLabel>
              {teams.map(team => (
                <SelectItem 
                  key={team.id} 
                  value={`team-${team.id}`}
                  className="border-l-2 border-blue-500/30 pl-3 mt-1"
                >
                  {team.name}
                </SelectItem>
              ))}
            </SelectGroup>
            
            <div className="my-2 border-t border-white/10" />
          </>
        )}
        
        <SelectGroup>
          <SelectLabel className="text-green-400 sticky top-0 bg-[#0F1629] z-10">Users</SelectLabel>
          {users.map(user => (
            <SelectItem 
              key={user.id} 
              value={`user-${user.id}`}
            >
              {user.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 