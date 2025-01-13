"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Team, TeamMember } from "@/types/teams"
import { AddMemberDialog } from "../components/AddMemberDialog"
import { TeamMemberCard } from "../components/TeamMemberCard"

interface TeamFormData {
  id?: string;
  name: string;
  description: string;
  department: string;
}

function TeamDetailsForm({ 
  formData, 
  setFormData, 
  loading, 
  onSubmit, 
  onCancel,
  onDelete 
}: { 
  formData: TeamFormData;
  setFormData: (data: TeamFormData) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter team name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => setFormData({ ...formData, department: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="management">Management</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="accounts">Accounts</SelectItem>
            <SelectItem value="trade_shop">Trade Shop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter team description"
          rows={3}
        />
      </div>

      <motion.div 
        className="flex justify-between gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            delay: 0.3,
            duration: 0.2
          }
        }}
      >
        {formData.id && onDelete && (
          <Button 
            type="button" 
            variant="destructive"
            onClick={onDelete}
          >
            Delete Team
          </Button>
        )}
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Team'}
          </Button>
        </div>
      </motion.div>
    </form>
  )
}

function TeamMembersManagement({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  async function loadMembers() {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load team members')
      }

      setMembers(data.members)
    } catch (error) {
      console.error('Error loading members:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load team members"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teamId !== 'new') {
      loadMembers()
    }
  }, [teamId])

  const handleAddMember = () => {
    setDialogOpen(true)
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members?userId=${memberId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      setMembers(members.filter(m => m.id !== memberId))
      toast({
        description: "Member removed successfully"
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove member"
      })
    }
  }

  if (teamId === 'new') {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Save the team first to manage members
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button onClick={handleAddMember}>Add Member</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No members in this team yet
        </div>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onRemove={() => handleRemoveMember(member.id)}
            />
          ))}
        </div>
      )}

      <AddMemberDialog
        teamId={teamId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onMemberAdded={loadMembers}
      />
    </div>
  )
}

export default function TeamSplitView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId')
  const isNew = teamId === 'new'
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    department: ''
  })

  useEffect(() => {
    if (teamId && teamId !== 'new') {
      loadTeam()
    }
  }, [teamId])

  async function loadTeam() {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load team')
      }

      setFormData({
        id: data.team.id,
        name: data.team.name,
        description: data.team.description || '',
        department: data.team.department
      })
    } catch (error) {
      toast("Failed to load team")
      router.push('/admin/teams')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    router.push('/admin/teams')
  }

  async function handleDelete() {
    if (!teamId || teamId === 'new') return

    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete team')
      }

      toast("Team deleted successfully")
      router.push('/admin/teams')
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to delete team")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.department) return

    try {
      setLoading(true)
      const url = isNew ? '/api/teams' : `/api/teams/${teamId}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          department: formData.department
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || `Failed to ${isNew ? 'create' : 'update'} team`)
      }

      if (isNew) {
        router.push(`/admin/teams?teamId=${data.team.id}`)
      } else {
        // Force a refresh of the page to update the teams list
        router.refresh()
        // Reload team data after update
        await loadTeam()
      }

      toast(isNew ? "Team created successfully" : "Team updated successfully")
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast(error instanceof Error ? error.message : `Failed to ${isNew ? 'create' : 'update'} team`)
    } finally {
      setLoading(false)
    }
  }

  if (!teamId) {
    return null
  }

  return (
    <div className="w-[480px] border-l border-white/[0.08] overflow-auto">
      <div className="border-b border-white/[0.08] p-6">
        <h2 className="text-lg font-semibold">
          {isNew ? "Create New Team" : "Edit Team"}
        </h2>
      </div>

      <div className="p-6">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Team Details</TabsTrigger>
            <TabsTrigger value="members" disabled={isNew}>Members</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="flex-1 mt-6">
            <TeamDetailsForm 
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              onDelete={!isNew ? handleDelete : undefined}
            />
          </TabsContent>
          <TabsContent value="members" className="flex-1 mt-6">
            {!isNew && <TeamMembersManagement teamId={teamId} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 