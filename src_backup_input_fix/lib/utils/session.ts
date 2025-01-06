import { Session } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { User, UserSession } from '@/types/users'

export function convertToSupabaseSession(session: any): UserSession {
  const user: User = {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email,
    role: session.user.role || 'user',
    department: session.user.department,
    createdAt: new Date(session.user.createdAt || Date.now()),
    updatedAt: new Date(session.user.updatedAt || Date.now())
  }

  return {
    access_token: session.supabaseAccessToken,
    refresh_token: session.supabaseRefreshToken,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user
  } as UserSession
}

export async function getSession(): Promise<UserSession | null> {
  const nextAuthSession = await getServerSession()
  if (!nextAuthSession) return null
  return convertToSupabaseSession(nextAuthSession)
} 