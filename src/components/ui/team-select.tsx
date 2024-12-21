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
  department: string
}

interface User {
  id: string
  name: string
  department: string
  is_active: boolean
  role: string
}

interface TeamSelectProps {
  onSelect: (selection: { type: 'user' | 'team', id: string, department?: string }) => void
  defaultValue?: { type: 'user' | 'team', id: string }
  includeTeams?: boolean
  disabled?: boolean
  currentDepartment?: string // Optional: to filter by department
  allowCrossDepartment?: boolean // Optional: to allow cross-department assignments
}

export function TeamSelect({ 
  onSelect, 
  defaultValue,
  includeTeams = true,
  disabled = false,
  currentDepartment,
  allowCrossDepartment = false
}: TeamSelectProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userMap = useRef(new Map<string, string>());

  useEffect(() => {
    fetchTeamsAndUsers()
  }, [currentDepartment])

  async function fetchTeamsAndUsers() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching users and teams...');
      
      const [teamsResponse, usersResponse] = await Promise.all([
        supabase.from('teams')
          .select('id, name, department'),
        supabase.from('users')
          .select('id, name, department, role, is_active')
          .eq('is_active', true)
      ])

      console.log('Raw User Response:', usersResponse.data?.map(u => ({ ...u, idLength: u.id.length })));
      console.log('Raw Team Response:', teamsResponse.data?.map(t => ({ ...t, idLength: t.id.length })));

      if (teamsResponse.error) throw teamsResponse.error
      if (usersResponse.error) throw usersResponse.error

      // Filter teams by department if specified
      let filteredTeams = teamsResponse.data || []
      if (currentDepartment && !allowCrossDepartment) {
        filteredTeams = filteredTeams.filter(team => team.department === currentDepartment)
      }
      setTeams(filteredTeams)

      // Filter users by department and active status
      let filteredUsers = usersResponse.data || []
      if (currentDepartment && !allowCrossDepartment) {
        filteredUsers = filteredUsers.filter(user => user.department === currentDepartment)
      }
      setUsers(filteredUsers)

      // Log filtered data
      console.log('Filtered users:', filteredUsers.map(u => ({ ...u, idLength: u.id.length })));
      console.log('Filtered teams:', filteredTeams.map(t => ({ ...t, idLength: t.id.length })));
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
        console.log('Raw value:', value);
        const [type, id] = value.split('-');
        console.log('Split values:', { type, id });
        
        if (!id) {
          console.error('No ID provided');
          return;
        }
        
        const selectedUser = users.find(u => u.id.includes(id));
        const selectedTeam = teams.find(t => t.id.includes(id));
        
        console.log('Found entities:', { selectedUser, selectedTeam });
        
        const selection = { 
          type: type as 'user' | 'team', 
          id: selectedUser?.id || selectedTeam?.id || id,
          department: type === 'user' ? selectedUser?.department : selectedTeam?.department
        };
        
        console.log('Final selection:', selection);
        onSelect(selection);
      }}
      defaultValue={defaultValue ? `${defaultValue.type}-${defaultValue.id.toString()}` : undefined}
      disabled={disabled}
    >
      <SelectTrigger className="w-full bg-[#1C2333] border-white/10 focus:border-blue-500 h-10">
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent 
        className="bg-[#0F1629] border-white/10 max-h-[300px]"
        position="popper"
      >
        {includeTeams && teams.length > 0 && (
          <>
            <SelectGroup>
              <SelectLabel className="text-blue-400 sticky top-0 bg-[#0F1629] z-10">Teams</SelectLabel>
              {teams.map(team => {
                console.log('Team ID:', team.id);
                return (
                  <SelectItem 
                    key={team.id} 
                    value={`team-${team.id.toString()}`}
                    className="border-l-2 border-blue-500/30 pl-3 mt-1"
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="truncate">{team.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 border-l border-gray-600 pl-2">{team.department}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
            
            <div className="my-2 border-t border-white/10" />
          </>
        )}
        
        <SelectGroup>
          <SelectLabel className="text-green-400 sticky top-0 bg-[#0F1629] z-10">Users</SelectLabel>
          {users.map(user => {
            console.log('User ID:', user.id);
            return (
              <SelectItem 
                key={user.id} 
                value={`user-${user.id.toString()}`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate">{user.name}</span>
                  <span className="text-xs text-gray-400 shrink-0 border-l border-gray-600 pl-2">{user.department}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 