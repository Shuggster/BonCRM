'use client'

import { useState } from 'react'
import { PriorityFilter } from './PriorityFilter'
import { StatusFilter } from './StatusFilter'
import { DueDateFilter } from './DueDateFilter'
import { AssignedToFilter } from './AssignedToFilter'
import { GroupFilter } from './GroupFilter'
import type { DueDateOption } from './DueDateFilter'
import type { AssignedToOption } from './AssignedToFilter'

interface TaskFiltersProps {
  onFiltersChange: (filters: {
    priority: 'high' | 'medium' | 'low' | null
    status: 'todo' | 'in-progress' | 'completed' | null
    dueDate: DueDateOption | null
    assignedTo: AssignedToOption | null
    group: string | null
  }) => void
  currentUserId: string
  users: Array<{ id: string; name: string }>
}

export function TaskFilters({ onFiltersChange, currentUserId, users }: TaskFiltersProps) {
  const [filters, setFilters] = useState({
    priority: null as 'high' | 'medium' | 'low' | null,
    status: null as 'todo' | 'in-progress' | 'completed' | null,
    dueDate: null as DueDateOption | null,
    assignedTo: null as AssignedToOption | null,
    group: null as string | null
  })

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.08]">
      <PriorityFilter
        selectedPriority={filters.priority}
        onPriorityChange={(priority) => updateFilters({ priority })}
      />
      <StatusFilter
        selectedStatus={filters.status}
        onStatusChange={(status) => updateFilters({ status })}
      />
      <DueDateFilter
        selectedDueDate={filters.dueDate}
        onDueDateChange={(dueDate) => updateFilters({ dueDate })}
      />
      <AssignedToFilter
        selectedAssignedTo={filters.assignedTo}
        onAssignedToChange={(assignedTo) => updateFilters({ assignedTo })}
        currentUserId={currentUserId}
        users={users}
      />
      <GroupFilter
        selectedGroup={filters.group}
        onGroupChange={(group) => updateFilters({ group })}
      />
    </div>
  )
} 