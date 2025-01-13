"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/api/admin/users')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load users')
        }

        setUsers(data.users)
      } catch (error: any) {
        console.error('Error loading users:', error)
        toast.error('Failed to load users', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading users...
      </div>
    )
  }

  return (
    <div className="divide-y divide-white/[0.08]">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => router.push(`/admin/users/${user.id}`)}
          className="w-full px-6 py-4 text-left hover:bg-white/[0.02] flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {user.role}
          </div>
        </button>
      ))}
    </div>
  )
} 