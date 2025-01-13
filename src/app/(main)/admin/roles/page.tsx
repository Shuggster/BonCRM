"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"

interface Permission {
  permission_name: string
  enabled: boolean
}

interface Role {
  id: string
  name: string
  permissions: Permission[]
}

const roles = [
  { 
    id: "admin", 
    name: "Admin",
    permissions: [] // Initialize with empty permissions
  },
  { 
    id: "manager", 
    name: "Manager",
    permissions: []
  },
  { 
    id: "operational", 
    name: "Operational",
    permissions: []
  }
]

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPermissions(selectedRole.id)
  }, [selectedRole.id])

  const loadPermissions = async (roleId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`)
      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }
      const data = await response.json()
      setSelectedRole(prev => ({
        ...prev,
        permissions: data.permissions
      }))
    } catch (error) {
      console.error("Error loading permissions:", error)
      toast.error("Failed to load permissions")
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (
    permission: Permission,
    enabled: boolean
  ) => {
    try {
      // Optimistically update UI
      setSelectedRole(prev => ({
        ...prev,
        permissions: prev.permissions.map(p =>
          p.permission_name === permission.permission_name
            ? { ...p, enabled }
            : p
        )
      }))

      // Update server
      const response = await fetch(
        `/api/admin/roles/${selectedRole.id}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            permissions: [{
              permission_name: permission.permission_name,
              enabled
            }]
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update permission")
      }

      toast.success("Permission updated successfully")
    } catch (error: any) {
      console.error("Error updating permission:", error)
      toast.error(error.message || "Failed to update permission")

      // Revert optimistic update
      setSelectedRole(prev => ({
        ...prev,
        permissions: prev.permissions.map(p =>
          p.permission_name === permission.permission_name
            ? { ...p, enabled: !enabled }
            : p
        )
      }))
    }
  }

  const formatPermissionName = (name: string) => {
    return name
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div className="flex space-x-4">
          {roles.map(role => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-colors ${
                selectedRole.id === role.id
                  ? "border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedRole({
                ...role,
                permissions: selectedRole.id === role.id 
                  ? selectedRole.permissions 
                  : []
              })}
            >
              <CardHeader className="pb-3">
                <CardTitle>{role.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRole.name} Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ))
              ) : (
                selectedRole.permissions.map(permission => (
                  <div
                    key={permission.permission_name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.permission_name}
                      checked={permission.enabled}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission, checked as boolean)
                      }
                    />
                    <Label htmlFor={permission.permission_name}>
                      {formatPermissionName(permission.permission_name)}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 