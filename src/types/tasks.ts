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
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  task_group_id: string | null
  user_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  task_groups?: {
    id: string
    name: string
    color: string
  }
  assigned_user?: {
    id: string
    name: string | null
    email: string
  }
  comments_count?: number
}

export interface TaskGroup {
  id: string
  name: string
  color: string
  description?: string | null
  created_at: string
  updated_at: string
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