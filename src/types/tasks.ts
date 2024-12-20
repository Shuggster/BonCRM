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
  relatedEvent?: string
  taskGroupId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  comments?: TaskComment[]
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  parentTaskId?: string
  watchers: {
    users: string[]
    teams: string[]
  }
} 