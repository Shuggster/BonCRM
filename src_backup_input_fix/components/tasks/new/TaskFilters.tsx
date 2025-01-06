'use client'

import { useState } from 'react'
import { PriorityFilter } from './PriorityFilter'
import { StatusFilter } from './StatusFilter'
import { DueDateFilter } from './DueDateFilter'
import { AssignedToFilter } from './AssignedToFilter'
import { GroupFilter } from './GroupFilter'
import { Button } from '@/components/ui/button'
import { LayoutGrid, BarChart2, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import { motion } from 'framer-motion'
import { TaskOverview } from './TaskOverview'
import { PRIORITY_COLORS } from '@/lib/constants'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { DueDateOption } from './DueDateFilter'
import type { AssignedToOption } from './AssignedToFilter'
import type { Task } from '@/types/tasks'

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
  tasks: Task[]
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
  setupInitialContent: () => void
}

export function TaskFilters({ onFiltersChange, currentUserId, users, tasks, onViewTask, onEditTask, setupInitialContent }: TaskFiltersProps) {
  const { hide, show, setContent } = useSplitViewStore()
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

  const handleRefresh = () => {
    hide();
    setTimeout(() => {
      setupInitialContent();
    }, 100);
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
      <div className="ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9 border border-white/[0.08] bg-transparent hover:bg-white/5"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Return To Task Overview</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 