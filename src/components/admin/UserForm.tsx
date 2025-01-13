"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface UserTeam {
  id: string;
  name: string;
  role: 'leader' | 'member';
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  department: string;
  teams?: UserTeam[];
}

export function UserForm({ onSubmit, onCancel, defaultValues }: {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<User>;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "operational",
    department: "accounts",
    ...defaultValues
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      console.error('Error submitting form:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter user's name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter user's email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter temporary password"
            required={!defaultValues?.id}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
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
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
          >
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

      <div className="border-t border-white/[0.08] p-6 mt-auto">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save User'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 