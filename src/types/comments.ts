export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    name?: string
  }
}

export type ActivityType = 
  | 'status_change'
  | 'group_change'
  | 'priority_change'
  | 'due_date_change'
  | 'title_change'
  | 'description_change'

export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  actionType: ActivityType
  previousValue: any
  newValue: any
  createdAt: Date
  user?: {
    id: string
    email: string
    name?: string
  }
} 