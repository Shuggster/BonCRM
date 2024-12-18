export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  taskGroupId?: string
  createdAt: Date
  updatedAt: Date
} 