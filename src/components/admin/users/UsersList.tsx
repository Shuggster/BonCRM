"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users2, Loader2, Search } from "lucide-react"
import { useUsers } from "@/hooks/useUsers"
import { cn } from "@/lib/utils"

export function UsersList() {
  const router = useRouter()
  const { users, isLoading } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const [displayedUsers, setDisplayedUsers] = useState(users || [])

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

  return (
    <div className="h-full">
      {/* Header with gradient background */}
      <div 
        className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px] border-b border-white/[0.08]" 
        style={{ 
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.05] flex items-center justify-center">
                <Users2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Team Members</h2>
                <p className="text-zinc-400 mt-1">Manage your organization's users</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("?action=new")}
              className="flex items-center gap-2"
            >
              <Users2 className="w-4 h-4" />
              New User
            </Button>
          </div>

          {/* Search input */}
          <div className="mt-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, email, role, or department..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-9 py-2 bg-[#111111] border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-zinc-400">
              {displayedUsers.length} users found
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-6">
        <div className="bg-[#111111] rounded-2xl border border-white/[0.08] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Name</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Email</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Role</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Department</th>
              </tr>
            </thead>
            <tbody className="bg-[#111111]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-zinc-400">
                    {searchQuery.trim() ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : displayedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-white/[0.08] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={() => router.push(`?userId=${user.id}`)}
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
  )
} 