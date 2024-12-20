'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Users } from 'lucide-react'

// Define role types based on your structure
type Role = 'admin' | 'manager' | 'operational'

// Update department type and configuration
type Department = 'management' | 'sales' | 'accounts' | 'trade_shop'

const DEPARTMENT_CONFIG = {
  management: {
    label: 'Management',
    description: 'Senior management and system administration'
  },
  sales: {
    label: 'Sales',
    description: 'Sales and customer management'
  },
  accounts: {
    label: 'Accounts',
    description: 'Financial and accounting operations'
  },
  trade_shop: {
    label: 'Trade Shop',
    description: 'Trade shop operations and management'
  }
} as const

// Replace existing DEPARTMENTS constant with:
const DEPARTMENTS = Object.keys(DEPARTMENT_CONFIG) as Department[]

const ROLE_CONFIG = {
  admin: {
    label: 'System Administrator',
    description: 'Full system access and configuration capabilities'
  },
  manager: {
    label: 'Department Manager',
    description: 'Department-specific management and oversight'
  },
  operational: {
    label: 'Operational Staff',
    description: 'Role-specific access and basic features'
  }
} as const

// Add after the Role and Department types
interface User {
  id: string
  email: string
  name: string
  role: Role
  department?: Department
  created_at: string
  is_active?: boolean
}

export default function UserManagement() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('operational')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState<typeof DEPARTMENTS[number] | ''>('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    role: '' as Role,
    department: '' as Department | ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, created_at, name, department, is_active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      if (data) {
        console.log('Fetched users:', data)
        setUsers(data)
      } else {
        console.log('No users found')
        setUsers([])
      }
    } catch (error: any) {
      console.error('Error fetching users:', {
        message: error.message,
        details: error?.details,
        stack: error?.stack
      })
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (!email || !password || !name || !role || !department) {
        toast.error('Please fill in all required fields')
        return
      }

      console.log('Creating user with:', { email, name, role, department })

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          department
        }),
      })

      const data = await response.json()
      console.log('Server response:', data)

      if (!response.ok) {
        console.error('Server error:', data)
        throw new Error(data.error || data.details || 'Failed to create user')
      }

      // Clear form
      setEmail('')
      setPassword('')
      setRole('operational')
      setName('')
      setDepartment('')

      // Refresh user list
      fetchUsers()
      
      toast.success('User created successfully')

    } catch (error: any) {
      console.error('Error creating user:', {
        error,
        message: error.message,
        details: error?.details,
        stack: error?.stack
      })
      toast.error(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/users/${editingUser?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          role: editForm.role,
          department: editForm.department
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit user')
      }

      // Refresh user list
      fetchUsers()

      // Close edit dialog
      setEditingUser(null)

      toast.success('User updated successfully')

    } catch (error: any) {
      console.error('Error editing user:', error.message || error)
      toast.error(error.message || 'Failed to edit user')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(id: string) {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      // Refresh user list
      fetchUsers()

      toast.success('User deleted successfully')

    } catch (error: any) {
      console.error('Error deleting user:', error.message || error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">User Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* User List - 8 columns on larger screens */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <h2 className="text-lg font-medium">Current Users</h2>
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.department ? DEPARTMENT_CONFIG[user.department]?.label : 'No Department'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {ROLE_CONFIG[user.role]?.label || user.role}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user)
                          setEditForm({
                            name: user.name,
                            role: user.role,
                            department: user.department || ''
                          })
                        }}
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Add User Form - 4 columns on larger screens */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-6">Add New User</h2>
            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_CONFIG).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {ROLE_CONFIG[role].description}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {DEPARTMENT_CONFIG[dept].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {department && (
                  <p className="text-sm text-muted-foreground">
                    {DEPARTMENT_CONFIG[department]?.description}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value as Role })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={editForm.department} onValueChange={(value) => setEditForm({ ...editForm, department: value as Department | '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {DEPARTMENT_CONFIG[dept].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
