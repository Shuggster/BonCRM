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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          department,
          name
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error creating user')
      }
      
      alert('User created successfully')
      setEmail('')
      setPassword('')
      setName('')
      setDepartment('')
      fetchUsers()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error creating user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create User Form */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              >
                {Object.entries(ROLE_LEVELS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {role !== 'admin' && role !== 'senior_management' && (
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-medium"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="p-4 bg-gray-700 rounded">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
                <div className="text-sm text-gray-400">
                  Role: {ROLE_LEVELS[user.role].label}
                  {user.department && ` - ${user.department}`}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 