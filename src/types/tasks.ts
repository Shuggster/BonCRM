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
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  assigned_to?: string
  assigned_to_type?: 'user' | 'team'
  department?: string
  taskGroupId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  comments?: TaskComment[]
}

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