"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users2 } from "lucide-react"
import { toast } from "sonner"
import { useUsers } from "@/hooks/useUsers"
import { cn } from "@/lib/utils"

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export function UserManagement() {
  const { data: session } = useSession()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { users, isLoading: usersLoading, mutate: refreshUsers } = useUsers()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      department: formData.get('department'),
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) throw new Error('Failed to create user')

      toast.success('User created successfully')
      setSelectedUser(null)
      refreshUsers()
    } catch (error) {
      toast.error('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUser?.id) return
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      department: formData.get('department'),
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast.success('User updated successfully')
      setSelectedUser(null)
      refreshUsers()
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Content Column - min 40% width */}
      <div className="flex-1 min-w-[40%] border-r border-white/[0.08]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Users</h1>
            <Button
              onClick={() => setSelectedUser({} as User)}
              className="flex items-center gap-2"
            >
              <Users2 className="w-4 h-4" />
              New User
            </Button>
          </div>

          <div className="bg-[#111111] rounded-2xl border border-white/[0.08]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users?.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-white/[0.08] hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => setSelectedUser(user as User)}
                  >
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        user.role === 'admin' && "bg-blue-500/20 text-blue-400",
                        user.role === 'manager' && "bg-green-500/20 text-green-400",
                        user.role === 'operational' && "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Split View Column - fixed 400px width */}
      <div className="w-[400px] bg-[#111111] border-l border-white/[0.08]">
        {selectedUser ? (
          <form onSubmit={selectedUser.id ? handleUpdateUser : handleCreateUser} className="h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6">{selectedUser.id ? 'Edit User' : 'New User'}</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedUser.name}
                    required
                    className="bg-[#111111] border-white/10"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email}
                    required
                    className="bg-[#111111] border-white/10"
                  />
                </div>

                {!selectedUser.id && (
                  <div>
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="bg-[#111111] border-white/10"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue={selectedUser.role || "operational"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" defaultValue={selectedUser.department || "accounts"}>
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
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save User'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-zinc-400">Select a user to edit</h2>
          </div>
        )}
      </div>
    </div>
  )
}