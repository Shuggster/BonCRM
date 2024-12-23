"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserSession } from '@/types/users'
import { Skeleton } from '@/components/ui/skeleton'

interface DepartmentFilterProps {
  selectedDepartments: string[]
  onChange: (departments: string[]) => void
  session: UserSession
  departments?: string[]
}

export function DepartmentFilter({ 
  selectedDepartments = [], 
  onChange,
  session,
  departments = []
}: DepartmentFilterProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Only show department filter for admins
  const isAdmin = session?.user?.role === 'admin'
  const userDepartment = session?.user?.department

  // If not admin, only show user's department
  const availableDepartments = isAdmin ? departments : (userDepartment ? [userDepartment] : [])

  // Initialize with all available departments selected
  useEffect(() => {
    if (availableDepartments.length > 0) {
      setIsLoading(false)
      if (selectedDepartments.length === 0) {
        onChange(availableDepartments)
      }
    }
  }, [availableDepartments, selectedDepartments, onChange])

  const toggleDepartment = (department: string) => {
    if (selectedDepartments.includes(department)) {
      // If it's the last selected department, select all departments
      if (selectedDepartments.length === 1) {
        onChange(availableDepartments)
      } else {
        onChange(selectedDepartments.filter(d => d !== department))
      }
    } else {
      onChange([...selectedDepartments, department])
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Departments</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no departments available
  if (availableDepartments.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Departments</h3>
      <div className="space-y-2">
        {availableDepartments.map((department) => (
          <button
            key={department}
            onClick={() => toggleDepartment(department)}
            className={cn(
              "flex items-center w-full gap-2 px-2 py-1.5 rounded-md text-sm",
              "transition-colors duration-200",
              selectedDepartments.includes(department) 
                ? "bg-blue-500/20 text-blue-400" 
                : "hover:bg-white/5"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              selectedDepartments.includes(department) 
                ? "bg-blue-500" 
                : "bg-gray-400"
            )} />
            <span>{department}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 