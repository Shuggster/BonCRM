import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { CalendarClient } from "./calendar-client"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  
  console.log('NextAuth Session:', session)
  
  if (!session) {
    return redirect('/login')
  }

  return <CalendarClient session={session} />
}
