"use client"

import { useState, useEffect } from "react"
import { Plus, Users, Search, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Team } from "@/types/teams"
import { CreateTeamModal } from "./CreateTeamModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define proper types for our structure
type Role = 'admin' | 'manager' | 'operational'
type Department = 'management' | 'sales' | 'accounts' | 'trade_shop'

interface DepartmentUser {
  id: string
  name: string
  email: string
  role: Role
}

interface DepartmentStructure {
  [key: string]: {
    managers?: DepartmentUser[]
    operational?: DepartmentUser[]
    admin?: DepartmentUser[]
  }
}

interface TeamCardProps {
  team: Team
  onManageMembers: () => void
}

// Separate TeamCard component for better organization
function TeamCard({ team, onManageMembers }: TeamCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{team.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {team.department}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onManageMembers}>
          <Users className="h-4 w-4" />
        </Button>
      </div>
      {team.description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {team.description}
        </p>
      )}
    </div>
  )
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const { data } = await response.json()
      setTeams(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter teams based on search and department
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={departmentFilter}
            onValueChange={(value) => setDepartmentFilter(value as Department | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="trade_shop">Trade Shop</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No teams found
          </div>
        ) : (
          filteredTeams.map(team => (
            <TeamCard 
              key={team.id} 
              team={team}
              onManageMembers={() => {/* TODO: Implement */}}
            />
          ))
        )}
      </div>

      <CreateTeamModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={() => {
          fetchTeams()
          setIsCreateModalOpen(false)
        }}
      />
    </div>
  )
} 