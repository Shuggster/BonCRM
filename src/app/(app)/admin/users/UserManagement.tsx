"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Label } from "@/components/ui/label"
import bcrypt from 'bcryptjs'

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
  const [role, setRole] = useState<Role>('operational') // default to operational role
  const [name, setName] = useState('')
  const [department, setDepartment] = useState<typeof DEPARTMENTS[number] | ''>('')

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
      // Don't alert in development
      // alert('Failed to fetch users: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      // Clear form
      setEmail('')
      setPassword('')
      setRole('operational')
      setName('')
      setDepartment('')

      // Refresh user list
      fetchUsers()

    } catch (error: any) {
      console.error('Error creating user:', error.message || error)
      alert(error.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User List */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Current Users</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.department ? DEPARTMENT_CONFIG[user.department]?.label : 'No Department'}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {ROLE_CONFIG[user.role]?.label || user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border bg-background text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border bg-background text-foreground"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {Object.entries(ROLE_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">
              {ROLE_CONFIG[role].description}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {DEPARTMENT_CONFIG[dept].label}
                </option>
              ))}
            </select>
            {department && (
              <p className="text-sm text-muted-foreground">
                {DEPARTMENT_CONFIG[department]?.description}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
    </div>
  )
}
