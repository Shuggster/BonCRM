import { Session } from "next-auth"
import { UserSession } from "@/types/users"

export function convertNextAuthToUserSession(session: Session | null): UserSession | null {
  if (!session?.user) return null
  
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as string | undefined,
      department: session.user.department as string | null | undefined,
      aud: 'authenticated'
    },
    expires_in: session.expires ? Math.floor((new Date(session.expires).getTime() - Date.now()) / 1000) : undefined,
    token_type: 'bearer'
  }
} 