export type CalendarEventRow = {
  id: string
  title: string
  description: string | null
  start_time: string // ISO date string
  end_time: string // ISO date string
  category: string
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    end_date?: string
  } | null
  created_at: string
  user_id: string
  assigned_to: string | null
  assigned_to_type: 'user' | 'team' | null
  department: string | null
} 