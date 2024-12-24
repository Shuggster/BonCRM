import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation'
import { authOptions } from "@/app/(auth)/lib/auth-options"
import { ContactsClient } from "./contacts-client"

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return redirect('/login')
  }

  return <ContactsClient session={session} />
}
