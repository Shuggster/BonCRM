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
import { Team } from "@/types/teams"

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

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
  onCancel 
}: { 
  formData: TeamFormData;
  setFormData: (data: TeamFormData) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
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
        className="flex justify-end gap-2"
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
      </motion.div>
    </form>
  )
}

function TeamMemberCard({ member, onRemove }: { member: TeamMember; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card">
      <div className="flex flex-col">
        <span className="font-medium">{member.name}</span>
        <span className="text-sm text-muted-foreground">{member.email}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRemove}
      >
        Remove
      </Button>
    </div>
  )
}

function TeamMembersManagement({ teamId }: { teamId: string }) {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await fetch(`/api/teams/${teamId}/members`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load team members')
        }

        setMembers(data.members)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    if (teamId !== 'new') {
      loadMembers()
    }
  }, [teamId])

  const handleAddMember = async () => {
    // TODO: Implement add member dialog
    toast({
      title: "Coming Soon",
      description: "Add member functionality will be implemented soon"
    })
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
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: ''
  })

  // Load team data if editing
  useEffect(() => {
    async function loadTeam() {
      if (!isNew && teamId) {
        try {
          const response = await fetch(`/api/teams/${teamId}`)
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to load team')
          }

          setFormData({
            name: data.team.name,
            description: data.team.description || '',
            department: data.team.department
          })
        } catch (error: any) {
          toast("Failed to load team")
          router.push('/admin/teams')
        }
      }
    }

    loadTeam()
  }, [teamId, isNew])

  const handleClose = () => {
    router.push('/admin/teams')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isNew ? '/api/teams' : `/api/teams/${teamId}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: isNew ? undefined : teamId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isNew ? 'create' : 'update'} team`)
      }

      toast(isNew ? "Team created successfully" : "Team updated successfully")
      router.push('/admin/teams')
      router.refresh()
    } catch (error: any) {
      toast(error.message || `Failed to ${isNew ? 'create' : 'update'} team`)
    } finally {
      setLoading(false)
    }
  }

  if (!teamId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a team to view details
      </div>
    )
  }

  return (
    <motion.div 
      className="flex-1 flex flex-col"
      initial={{ x: "100%" }}
      animate={{ 
        x: 0,
        transition: {
          type: "spring",
          stiffness: 50,
          damping: 15
        }
      }}
      exit={{ x: "100%" }}
    >
      <motion.div 
        className="border-b border-white/[0.08] p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            delay: 0.1,
            duration: 0.2
          }
        }}
      >
        <h2 className="text-lg font-semibold">
          {isNew ? "Create New Team" : "Edit Team"}
        </h2>
      </motion.div>

      <motion.div 
        className="flex-1 min-h-0 p-6"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: {
            delay: 0.2,
            duration: 0.2
          }
        }}
      >
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
            />
          </TabsContent>
          <TabsContent value="members" className="flex-1 mt-6">
            <TeamMembersManagement teamId={teamId} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
} 