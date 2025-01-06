import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/(auth)/lib/auth-options"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side role check
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex-1 flex">
      {/* Column 2: Main Content */}
      <div className="flex-1 min-w-0 bg-zinc-950">
        <div className="h-full flex flex-col">
          {children}
        </div>
      </div>

      {/* Column 3: Split View */}
      <div className="w-[400px] border-l border-white/[0.08] bg-black/20">
        <div className="h-full flex flex-col">
          {/* Split view content will be rendered by pages */}
        </div>
      </div>
    </div>
  )
} 