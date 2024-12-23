export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  taskGroupId?: string
  assigned_to?: string | null
  assigned_to_type?: 'user' | 'team' | null
  department?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  schedule_status?: ScheduleStatus | null
}

export type ScheduleStatus = 'scheduled' | 'unscheduled' | 'pending'

export interface TaskFilters {
  search: string
  statuses: string[]
  priorities: string[]
  groups: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  assignedToMe: boolean
  hasComments: boolean
  isOverdue: boolean
}

export interface TaskFilterPreset {
  id: string
  userId: string
  name: string
  filters: TaskFilters
  createdAt: Date
  updatedAt: Date
} 