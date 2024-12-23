import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { CalendarClient } from "./calendar-client"
import { toUserSession } from "@/types/session"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return redirect('/login')
  }

  // Ensure all required fields are present
  if (!session.user.id || !session.user.role || !session.user.department) {
    console.error('Invalid session data:', session)
    return redirect('/login')
  }

  try {
    const userSession = toUserSession(session)
    return <CalendarClient session={userSession} />
  } catch (error) {
    console.error('Error converting session:', error)
    return redirect('/login')
  }
}
