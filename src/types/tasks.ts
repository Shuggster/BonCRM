export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  assignedTo?: string
  relatedEvent?: string
  taskGroupId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  comments?: TaskComment[]
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number  // e.g., every 2 days, every 3 weeks
    endDate?: Date
  }
  parentTaskId?: string  // For recurring task instances
} 