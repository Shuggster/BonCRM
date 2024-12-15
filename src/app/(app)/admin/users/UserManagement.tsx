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
  department?: string
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
  const [role, setRole] = useState('user') // default role
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
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)

      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Then store additional user data in your users table
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              role,
              name,
              department,
            },
          ])

        if (dbError) throw dbError

        // Clear form
        setEmail('')
        setPassword('')
        setRole('user')
        setName('')
        setDepartment('')

        // Refresh user list
        fetchUsers()
      }
    } catch (error) {
      console.error('Error creating user:', error)
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
              {user.department && (
                <p className="text-sm text-muted-foreground mt-2">
                  Department: {user.department}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full p-2 rounded border"
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
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 rounded border"
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
