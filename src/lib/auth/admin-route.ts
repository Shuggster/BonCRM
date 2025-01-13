import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(auth)/lib/auth-options"

type RouteHandler = (req?: Request) => Promise<NextResponse>

export function withAdminProtect(handler: RouteHandler): RouteHandler {
  return async (req) => {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return handler(req)
  }
} 