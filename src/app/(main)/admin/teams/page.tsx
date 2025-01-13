"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, Search, Building2, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  isSelected: boolean
  onClick: () => void
}

function TeamCard({ team, isSelected, onClick }: TeamCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected 
          ? "bg-accent border-accent-foreground/20" 
          : "bg-card hover:bg-accent/50 border-white/[0.08]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{team.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            {team.department}
          </div>
        </div>
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
  const teamId = searchParams.get('teamId')
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all')
  const { toast } = useToast()

  async function fetchTeams() {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch teams')
      }

      setTeams(data.teams || [])
    } catch (error: any) {
      console.error('Error fetching teams:', error)
      toast({
        title: "Error",
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
  }, [searchParams])

  const handleTeamClick = (team: Team) => {
    router.push(`/admin/teams?teamId=${team.id}`)
  }

  const handleCreateTeam = () => {
    router.push('/admin/teams?teamId=new')
  }

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
          title: "Success",
          description: `Successfully removed ${data.deletedCount} duplicate teams.`
        })
        await fetchTeams()
      } else {
        toast({
          title: "Info",
          description: "No duplicate teams found."
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cleanup teams",
        variant: "destructive"
      })
    } finally {
      setCleaning(false)
    }
  }

  return (
    <div className="h-full flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-none border-b border-white/[0.08] bg-background p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-semibold">Teams</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{teams?.length || 0}</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 min-w-0 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              <SelectTrigger className="w-full lg:w-[150px]">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCleanup}
                disabled={cleaning}
                className="flex-1 lg:flex-none whitespace-nowrap"
              >
                {cleaning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Clean Duplicates
              </Button>
              <Button 
                onClick={handleCreateTeam}
                className="flex-1 lg:flex-none whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchQuery.trim() ? 'No teams found matching your search.' : 'No teams found.'}
            </div>
          ) : (
            filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isSelected={team.id === teamId}
                onClick={() => handleTeamClick(team)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 