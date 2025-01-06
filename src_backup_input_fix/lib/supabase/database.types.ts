export interface Database {
  public: {
    Tables: {
      task_groups: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          task_group_id?: string | null
          user_id: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          task_group_id?: string | null
          user_id?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          category: string
          type: 'call' | 'email' | 'meeting' | 'follow_up' | null
          status: string
          priority: string
          location: string | null
          recurrence: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
            exception_dates?: string[]
          } | null
          created_at: string
          updated_at: string
          user_id: string
          assigned_to: string | null
          assigned_to_type: 'user' | 'team' | null
          department: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          category?: string
          type?: 'call' | 'email' | 'meeting' | 'follow_up' | null
          status?: string
          priority?: string
          location?: string | null
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
            exception_dates?: string[]
          } | null
          created_at?: string
          updated_at?: string
          user_id?: string
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          category?: string
          type?: 'call' | 'email' | 'meeting' | 'follow_up' | null
          status?: string
          priority?: string
          location?: string | null
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
            interval?: number
            end_date?: string
            exception_dates?: string[]
          } | null
          created_at?: string
          updated_at?: string
          user_id?: string
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
        }
      }
      task_calendar_relations: {
        Row: {
          id: string
          task_id: string
          event_id: string
          relation_type: 'deadline' | 'working_session' | 'review'
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          task_id: string
          event_id: string
          relation_type: 'deadline' | 'working_session' | 'review'
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          task_id?: string
          event_id?: string
          relation_type?: 'deadline' | 'working_session' | 'review'
          created_at?: string
          created_by?: string
        }
      }
      activity_calendar_relations: {
        Row: {
          id: string
          activity_id: string
          calendar_event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          calendar_event_id: string
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          calendar_event_id?: string
          created_at?: string
        }
      }
      scheduled_activities: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          title: string
          type: 'call' | 'email' | 'meeting' | 'follow_up'
          description: string | null
          scheduled_for: string
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contact_id: string
          title: string
          type: 'call' | 'email' | 'meeting' | 'follow_up'
          description?: string | null
          scheduled_for: string
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          title?: string
          type?: 'call' | 'email' | 'meeting' | 'follow_up'
          description?: string | null
          scheduled_for?: string
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          assignable_id: string
          assignable_type: 'calendar_event' | 'task' | 'activity'
          assigned_to: string
          assigned_to_type: 'user' | 'team' | 'contact'
          created_at: string
        }
        Insert: {
          id?: string
          assignable_id: string
          assignable_type: 'calendar_event' | 'task' | 'activity'
          assigned_to: string
          assigned_to_type: 'user' | 'team' | 'contact'
          created_at?: string
        }
        Update: {
          id?: string
          assignable_id?: string
          assignable_type?: 'calendar_event' | 'task' | 'activity'
          assigned_to?: string
          assigned_to_type?: 'user' | 'team' | 'contact'
          created_at?: string
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