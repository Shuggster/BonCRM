export interface Database {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          category: string
          recurrence: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
          } | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          category?: string
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
          } | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          category?: string
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
          } | null
          created_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 