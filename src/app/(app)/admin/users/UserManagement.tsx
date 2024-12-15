"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Define role types based on your structure
type Role = 'admin' | 'senior_management' | 'department_manager' | 'operational'

interface User {
  id: string
  email: string
  role: Role
  created_at: string
  name: string
}

const DEPARTMENTS = ['Sales', 'Accounts', 'Trade Shop', 'Sales/Admin'] as const

const ROLE_LEVELS = {
  admin: {
    label: 'System Administrator',
    description: 'Full system access and configuration capabilities'
  },
  senior_management: {
    label: 'Senior Management',
    description: 'Complete overview and access to all features'
  },
  department_manager: {
    label: 'Department Manager',
    description: 'Department-specific full access and team management'
  },
  operational: {
    label: 'Operational Staff',
    description: 'Role-specific access and basic features'
  }
} as const

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
        .select('id, email, role, created_at, name')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
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
      console.error('Error fetching users:', error.message || error)
      alert('Failed to fetch users: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)

      // Create new user in Auth with role in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name
          }
        }
      })

      if (authError) {
        console.error('Auth Error:', authError)
        throw authError
      }

      if (!authData.user?.id) {
        throw new Error('Failed to create user in Auth')
      }

      // Add user to users table
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            role,
            name
          },
        ])

      if (dbError) {
        console.error('Database Error:', dbError)
        throw dbError
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
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {ROLE_LEVELS[user.role]?.label || user.role}
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
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-2 rounded border bg-background text-foreground"
              required
            >
              {Object.entries(ROLE_LEVELS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 rounded border bg-background text-foreground"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
