import type { Session } from 'next-auth'

export interface User {
  id: string
  email: string | null
  role: string
  department: string
  name?: string | null
}

export interface UserSession {
  user: User
}

export function toUserSession(session: Session): UserSession {
  if (!session?.user?.id || !session.user.role || !session.user.department) {
    throw new Error('Invalid session data')
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      department: session.user.department,
      name: session.user.name
    }
  }
}