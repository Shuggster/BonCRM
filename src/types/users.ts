import { Session } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string | null
  name?: string | null
  role?: string
}

export type UserSession = Session & {
  user: User
} 