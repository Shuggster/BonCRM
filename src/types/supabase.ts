export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_fkey"
            columns: ["department"]
            referencedRelation: "users"
            referencedColumns: ["department"]
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          category: string | null
          recurrence: {
            frequency: 'daily' | 'weekly' | 'monthly'
            interval: number
            end_date?: string
          } | null
          user_id: string
          assigned_to: string | null
          assigned_to_type: 'user' | 'team' | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          category?: string | null
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly'
            interval: number
            end_date?: string
          } | null
          user_id: string
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          category?: string | null
          recurrence?: {
            frequency: 'daily' | 'weekly' | 'monthly'
            interval: number
            end_date?: string
          } | null
          user_id?: string
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "scheduled_activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_calendar_relations: {
        Row: {
          id: string
          activity_id: string
          calendar_event_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          calendar_event_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          calendar_event_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_calendar_relations_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "scheduled_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_calendar_relations_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          }
        ]
      }
      task_activities: {
        Row: {
          id: string
          task_id: string
          user_id: string
          type: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          type: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activities_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          assigned_to: string | null
          assigned_to_type: 'user' | 'team' | null
          department: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
          user_id: string
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
          assigned_to?: string | null
          assigned_to_type?: 'user' | 'team' | null
          department?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          role: 'admin' | 'user'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          role?: 'admin' | 'user'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          role?: 'admin' | 'user'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
