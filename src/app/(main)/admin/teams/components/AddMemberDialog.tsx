"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  email: string
}

interface AddMemberDialogProps {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onMemberAdded: () => void
}

export function AddMemberDialog({ teamId, open, onOpenChange, onMemberAdded }: AddMemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const { toast } = useToast()

  // Load available users when search query changes
  async function searchUsers() {
    if (!searchQuery.trim()) {
      setUsers([])
      return
    }

    try {
      setLoading(true)
      console.log('Searching for:', searchQuery)
      const response = await fetch(`/api/teams/${teamId}/available-users?search=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (!response.ok) {
        console.error('Server error details:', data)
        throw new Error(data.error || data.details || "Failed to load users")
      }

      if (!data.users) {
        throw new Error("No users data received")
      }

      setUsers(data.users)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to load users"
      })
    } finally {
      setLoading(false)
    }
  }

  // Add user to team
  async function handleAddUser(userId: string) {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to add member")
      }

      toast({
        description: "Member added successfully"
      })
      onMemberAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to add member"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search for users by name or email to add them to the team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && searchUsers()}
              placeholder="Search users by name or email"
              className="flex-1"
            />
            <Button onClick={searchUsers} disabled={loading}>
              Search
            </Button>
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery.trim() ? "No users found" : "Search for users to add"}
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddUser(user.id)}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 