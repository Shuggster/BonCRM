export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export type ActivityType = 
  | 'status_change'
  | 'priority_change'
  | 'title_change'
  | 'description_change'
  | 'due_date_change'
  | 'group_change'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'assigned_change'
  | 'attachment_added'
  | 'attachment_removed'
  | 'subtask_added'
  | 'subtask_completed'

export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  actionType: ActivityType
  previousValue: any
  newValue: any
  createdAt: Date
} 