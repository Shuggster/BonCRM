"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the users page with the userId as a query parameter
    router.replace(`/admin/users?userId=${params.userId}`)
  }, [params.userId, router])

  return null
} 