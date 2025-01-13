"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, Loader2, Trash2, KeyRound, Copy } from "lucide-react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TeamAssignments } from "./TeamAssignments"

interface UserFormProps {
  user?: {
    id?: string
    name: string
    email: string
    role: string
    department: string
  }
  onSuccess: () => void
  onCancel: () => void
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "operational", label: "Operational" }
]

const departmentOptions = [
  { value: "management", label: "Management" },
  { value: "sales", label: "Sales" },
  { value: "accounts", label: "Accounts" },
  { value: "trade_shop", label: "Trade Shop" }
]

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "operational",
    department: user?.department || "accounts",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user?.id) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email.toLowerCase(),
            role: formData.role,
            department: formData.department,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) throw updateError
        toast.success('User updated successfully')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Please enter a temporary password')
          setIsLoading(false)
          return
        }

        // Hash the password using the API endpoint
        const hashResponse = await fetch('/api/auth/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: formData.password })
        })

        if (!hashResponse.ok) {
          throw new Error('Failed to hash password')
        }

        const { hashedPassword } = await hashResponse.json()

        const { error: createError } = await supabase
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

        if (createError) throw createError
        toast.success('User created successfully. They can log in with their email and the temporary password you provided.')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to save user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setIsResettingPassword(true)
    try {
      const tempPassword = Math.random().toString(36).slice(-8) // Generate an 8-character random string
      
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
      
      const { error } = await supabase
        .from('users')
        .update({ 
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error
      
      // Store the temporary password and show the dialog
      setTemporaryPassword(tempPassword)
      setShowPasswordDialog(true)
      toast.success('Password reset successfully')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setIsResettingPassword(false)
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id)

      if (error) throw error
      toast.success('User deleted successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter name"
              className="bg-[#111111] border-white/10"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Enter email"
              className="bg-[#111111] border-white/10"
            />
          </div>

          {!user?.id && (
            <div>
              <Label>Temporary Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="Enter temporary password"
                className="bg-[#111111] border-white/10"
              />
            </div>
          )}

          <div>
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user?.id && (
            <div className="pt-4 border-t border-white/10">
              <TeamAssignments userId={user.id} />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-6">
          <div className="flex items-center gap-2">
            {user?.id ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || isLoading}
                  className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400"
                >
                  <KeyRound className="w-4 h-4" />
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDeleting || isLoading}
                      className="flex items-center gap-2 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the user
                        and remove their data from the system.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => document.querySelector('dialog')?.close()}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isDeleting || isResettingPassword}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isDeleting || isResettingPassword}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {user?.id ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
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
              onClick={() => setShowPasswordDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 