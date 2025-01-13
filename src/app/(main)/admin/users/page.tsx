"use client"

import { useRouter } from "next/navigation"
import { useUsers } from "@/hooks/useUsers"
import { useSplitViewStore } from "@/components/layouts/SplitViewContainer"
import { motion } from "framer-motion"
import { Users2, Mail, Building2, Shield, Search, Plus, X, Save, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { UserFormProvider } from "@/components/admin/users/UserFormContext"
import { QuickAddUser } from "@/components/admin/users/QuickAddUser"
import { cn } from "@/lib/utils"
import { UserForm } from "@/components/admin/users/UserForm"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function UsersPage() {
  const router = useRouter()
  const { users, isLoading, mutate } = useUsers()
  const { setContentAndShow, hide } = useSplitViewStore()
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayedUsers, setDisplayedUsers] = useState<any[]>([])
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState("")

  // Update displayed users when users data changes
  useEffect(() => {
    setDisplayedUsers(users || [])
  }, [users])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      setDisplayedUsers(users || [])
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = users?.filter(user => {
      const name = (user.name || "").toLowerCase()
      const email = (user.email || "").toLowerCase()
      const role = (user.role || "").toLowerCase()
      const department = (user.department || "").toLowerCase()
      
      return name.includes(lowercaseQuery) || 
             email.includes(lowercaseQuery) || 
             role.includes(lowercaseQuery) || 
             department.includes(lowercaseQuery)
    }) || []

    setDisplayedUsers(filtered)
  }

  const roleStyles = {
    admin: "bg-blue-500/20 text-blue-400",
    manager: "bg-green-500/20 text-green-400",
    operational: "bg-yellow-500/20 text-yellow-400"
  }

  const departmentOptions = [
    { value: "management", label: "Management" },
    { value: "sales", label: "Sales" },
    { value: "accounts", label: "Accounts" },
    { value: "trade_shop", label: "Trade Shop" }
  ]

  const handleUserClick = (user: any) => {
    const topContent = (
      <motion.div
        key={user.id}
        className="h-full"
        initial={{ y: "-100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <div className="rounded-t-2xl bg-[#111111] border-b border-white/[0.08]">
          {/* Main User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.08] flex items-center justify-center">
                <span className="text-xl font-medium">
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-zinc-400 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm text-zinc-400">Role</div>
                  <div className="text-white capitalize">{user.role}</div>
                </div>
              </div>
              {user.department && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-white/10">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-zinc-400">Department</div>
                    <div className="text-white">{user.department}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )

    const bottomContent = (
      <motion.div
        key={`${user.id}-bottom`}
        className="h-full"
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <UserForm 
          user={user}
          onSuccess={async () => {
            await mutate()
            hide()
          }}
          onCancel={hide}
        />
      </motion.div>
    )

    setContentAndShow(topContent, bottomContent, user.id)
  }

  const handleCreateSuccess = async () => {
    await mutate()
    hide()
  }

  const handleCreateUser = () => {
    const topContent = (
      <motion.div
        key="create-user"
        className="h-full"
        initial={{ y: "-100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <div className="rounded-t-2xl bg-[#111111] border-b border-white/[0.08]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.08] flex items-center justify-center">
                <Users2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Create New User</h2>
                <p className="text-zinc-400 mt-1">Add a new team member</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )

    const bottomContent = (
      <motion.div
        key="create-user-bottom"
        className="h-full"
        initial={{ y: "100%" }}
        animate={{ 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
          }
        }}
      >
        <QuickAddUser 
          onSuccess={handleCreateSuccess}
          onCancel={hide}
        />
      </motion.div>
    )

    setContentAndShow(topContent, bottomContent, 'create-user')
  }

  const handleSubmit = async (formData: any) => {
    setIsCreating(true)
    setError(null)

    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      
      // Hash the password using the API endpoint
      const hashResponse = await fetch('/api/auth/hash-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: tempPassword })
      })

      if (!hashResponse.ok) {
        throw new Error('Failed to hash password')
      }

      const { hashedPassword } = await hashResponse.json()

      // Create the user in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          name: formData.name,
          email: formData.email.toLowerCase(),
          role: formData.role,
          department: formData.department,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          password_hash: hashedPassword
        }])
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
        throw new Error(userError.message)
      }

      // Store the temporary password and show the dialog
      setTemporaryPassword(tempPassword)
      setShowPasswordDialog(true)

      // Refresh the users list
      await mutate()
    } catch (err: any) {
      console.error('Error creating user:', err)
      setError(err.message || 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Password copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy password')
    }
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Users</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users2 className="w-4 h-4" />
            {users?.length || 0}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 text-white placeholder:text-zinc-500 border border-white/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
            />
          </div>
          <Button 
            onClick={handleCreateUser}
            className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
          >
            Add User
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-white/[0.08]">
        {isLoading ? (
          <div className="p-6 text-center text-zinc-400">
            Loading users...
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-6 text-center text-zinc-400">
            {searchQuery.trim() ? 'No users found matching your search.' : 'No users found.'}
          </div>
        ) : displayedUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="w-full px-6 py-4 text-left hover:bg-white/[0.02] flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.08] flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-zinc-400">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    roleStyles[user.role as keyof typeof roleStyles] || "bg-zinc-500/20 text-zinc-400"
                  )}>
                    {user.role}
                  </span>
                </div>
                {user.department && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="capitalize">{user.department}</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open)
        if (!open) hide() // Close the form when dialog is closed
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>
              Please provide this temporary password to the user. They will be able to log in with it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 bg-[#111111] p-3 rounded-md">
            <code className="flex-1">{temporaryPassword}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(temporaryPassword)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowPasswordDialog(false)
                hide()
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 