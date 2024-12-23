import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from "@/app/(auth)/lib/auth-options"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return redirect('/login')
  }
  
  return redirect('/dashboard')
}