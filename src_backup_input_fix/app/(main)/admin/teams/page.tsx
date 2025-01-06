"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, Search, Building2, Loader2, Plus } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Team } from "@/types/teams"
import { useToast } from "@/components/ui/use-toast"

type Department = 'management' | 'sales' | 'accounts' | 'trade_shop'

interface TeamCardProps {
  team: Team
  onSelect: () => void
  isSelected?: boolean
}

function TeamCard({ team, onSelect, isSelected }: TeamCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-accent border-accent-foreground/20' 
          : 'bg-card hover:bg-accent/50 border-white/[0.08]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{team.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {team.department}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
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

export default function TeamsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(searchParams.get('teamId'))
  const { toast } = useToast()

  async function fetchTeams() {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch teams')
      }

      setTeams(data.teams || [])
    } catch (error: any) {
      console.error('Error fetching teams:', error)
      toast({
        description: error.message || "Failed to load teams",
        variant: "destructive"
      })
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  // Updated team selection handler
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId)
    router.push(`/admin/teams?teamId=${teamId}`)
  }

  // Updated create team handler
  const handleCreateTeam = () => {
    router.push('/admin/teams?teamId=new')
  }

  // Filter teams based on search and department
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || team.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  async function handleCleanup() {
    try {
      setCleaning(true)
      const response = await fetch('/api/teams/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to cleanup teams')
      }

      if (data.deletedCount > 0) {
        toast({
          description: `Successfully removed ${data.deletedCount} duplicate teams.`
        })
        // Refresh the teams list
        await fetchTeams()
      } else {
        toast({
          description: "No duplicate teams found."
        })
      }
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Failed to cleanup teams",
        variant: "destructive"
      })
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6">
        <PageHeader 
          heading="Team Management" 
          description="Create and manage teams across departments"
          icon={Users}
        />
      </div>

      <div className="flex-1 min-h-0 p-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCleanup}
              disabled={cleaning}
            >
              {cleaning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Clean Duplicates
            </Button>
            <Button onClick={handleCreateTeam}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {teams.length === 0 ? "No teams found. Create your first team!" : "No teams match your filters."}
            </div>
          ) : (
            filteredTeams.map(team => (
              <TeamCard 
                key={team.id} 
                team={team}
                onSelect={() => handleTeamSelect(team.id)}
                isSelected={team.id === selectedTeamId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 