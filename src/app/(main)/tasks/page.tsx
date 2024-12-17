import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { TasksClient } from "./tasks-client"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return redirect('/login')
  }

  return <TasksClient session={session} />
}
