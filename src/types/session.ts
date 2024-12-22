import type { Session } from 'next-auth'

export interface UserSession {
  user: {
    id: string
    role: string
    email: string
    name: string | null
    department: string
  }
}

export function toUserSession(session: Session): UserSession {
  return {
    user: {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email!,
      name: session.user.name,
      department: session.user.department
    }
  }
}