import { redirect } from 'next/navigation'
import { toUserSession } from '@/types/session'
import { getSession } from '@/app/(auth)/lib/session'
import CalendarClient from './calendar-client'
import { SplitViewContainer } from '@/components/layouts/SplitViewContainer'

export default async function CalendarPage() {
  const session = await getSession()

  if (!session) {
    return redirect('/login')
  }
   
  try {
    const userSession = toUserSession(session)
    return (
      <div className="flex h-screen">
        {/* Main Calendar View */}
        <div className="flex-1 overflow-hidden">
          <CalendarClient session={userSession} />
        </div>

        {/* Split View */}
        <SplitViewContainer />
      </div>
    )
  } catch (error) {
    console.error('Error converting session:', error)
    return redirect('/login')
  }
}
