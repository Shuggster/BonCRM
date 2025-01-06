import { Session } from '@supabase/supabase-js'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  department?: string
  createdAt: Date
  updatedAt: Date
}

export type UserSession = Session & {
  user: User
} 