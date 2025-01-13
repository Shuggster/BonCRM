"use client"

import { UserForm } from "@/components/admin/users/UserForm"
import { useSearchParams } from "next/navigation"

export default function UserView() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const isNew = searchParams.get('action') === 'new'

  if (!userId && !isNew) return null

  return (
    <div className="p-6">
      <UserForm 
        userId={userId} 
        isNew={isNew}
      />
    </div>
  )
} 